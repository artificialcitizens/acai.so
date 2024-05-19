import requests

from flask import Flask, request, jsonify

from werkzeug.utils import secure_filename
import os
from tools.audio.whisperx_transcription import create_transcript, quick_transcribe
from tools.loaders.youtube_ripper import rip_youtube

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"

from urllib.parse import urlparse

def allowed_file(filename):
    ALLOWED_EXTENSIONS = set(['wav', 'mp3', 'flac', 'aac', 'ogg', 'm4a', 'mp4'])
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/transcribe', methods=['POST'])
def transcribe():
    file, filename, filepath = extract_file_or_url(request)
    if not file:
        return jsonify({"error": "No file or URL provided"}), 400
    if not allowed_file(filename):
        return jsonify({"error": "File type not permitted"}), 400
    return process_transcription(request, filepath, filename)

def extract_file_or_url(request):
    file = None
    filename = ''
    filepath = ''
    if 'file' in request.files:
        file = request.files['file']
        filename = file.filename
    elif 'url' in request.form:
        file, filename, filepath = handle_url(request.form['url'])
    if file and hasattr(file, 'save'):
        filepath = save_file(file, filename)
    return file, filename, filepath

def handle_url(url):
    file, filename, filepath = None, '', ''
    if 'youtube.com' in url or 'youtu.be' in url:
        # Assuming rip_youtube returns an _io.BytesIO object
        audio_data_io = rip_youtube(url)
        audio_data = audio_data_io.getvalue()  # Convert to bytes
        filename = 'youtube_audio.mp4'
    else:
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            audio_data = response.content
        else:
            return None, '', ''
    filepath = os.path.join('/tmp', filename)
    with open(filepath, 'wb') as f:
        f.write(audio_data)
    file = type('File', (object,), {'filename': filename})
    return file, filename, filepath

def save_file(file, filename):
    filename = secure_filename(filename)
    filepath = os.path.join('/tmp', filename)
    file.save(filepath)
    return filepath

def process_transcription(request, filepath, filename):
    diarization_str = request.form.get('diarization', 'false').lower()
    diarization = diarization_str != 'false'
    
    if diarization:
        return full_transcription_flow(request, filepath, filename)
    else:
        return quick_transcription_flow(request, filepath, filename)

def quick_transcription_flow(request, filepath, filename):
    url = request.form.get('url', filename)
    try:
        transcript = quick_transcribe(audio_file=filepath)
        return jsonify({"transcript": transcript, "src": url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def full_transcription_flow(request, filepath, filename):
    min_speakers = request.form.get('minSpeakers', 1)
    max_speakers = request.form.get('maxSpeakers', 3)
    file_name = request.form.get('url', filename)
    transcript = create_transcript(audio_file=filepath, min_speakers=int(min_speakers), max_speakers=int(max_speakers))

    return jsonify({"transcript": transcript, "src": file_name}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5051)
