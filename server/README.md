# ACAI Server

## Usage

Setup local environment:

```
conda create -n ava python=3.10
conda activate ava
pip install -r requirements.txt
```

Run:

```
python main.py
```

### Docker

Use Docker:

```
docker build -t ava .
```

```
docker run -p 5050:5050 ava
```

## Crew Manager

An api for creating and managing [CrewAI](https://github.com/joaomdmoura/crewAI) agents.

```curl
curl  -X POST \
  'http://localhost:5050/run-crew' \
  --header 'Accept: */*' \
  --header 'User-Agent: Thunder Client (https://www.thunderclient.com)' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "agents": [
    {
      "name": "Grant",
      "role": "Product Manager",
      "goal": "Orchestrate the team to create the design system, based on the clients needs. You will be provided the goal for the sprint and you will need to create a task list for the team and assign the tasks to the team members.",
      "backstory": "You manage the design system for Knapsack, It is called Toby. You run a small team of highly intelligent designers. You are responsible for the overall success of the design system. Provide the members of your team with a task list based off of the need of the current sprint.",
      "llm": {
        "base_url": "http://192.168.4.192:8080/v1",
        "model_name": "open-hermes-2.5",
        "openai_api_key": "sk-xxx"
      },
      "tools": ["DuckDuckGoSearch"],
      "files": ["1"],
      "metadata": {},
      "verbose": true,
      "allow_delegation": true
    },
    {
      "role": "Senior Research",
      "name": "Jim",
      "goal": "Research the best way to create a design system for Knapsack.",
      "tools": ["DuckDuckGoSearch"],
      "llm": {
        "base_url": "http://192.168.4.192:8080/v1",
        "model_name": "open-hermes-2.5",
        "openai_api_key": "sk-xxx"
      },
      "files": ["1"],
      "metadata": {},
      "verbose": true,
      "allow_delegation": false
    },
    {
      "name": "Matt",
      "role": "Designer",
      "goal": "Create a design system for Knapsack.",
      "backstory": "A creative soul who translates complex tech jargon into beautiful designs for the masses, you write using simple words in a friendly and inviting tone that does not sounds like AI.",
      "llm": {
        "base_url": "http://192.168.4.192:8080/v1",
        "model_name": "open-hermes-2.5",
        "openai_api_key": "sk-xxx"
      },
      "tools": [],
      "files": ["1"],
      "metadata": {},
      "verbose": true,
      "allow_delegation": true
    }
  ],
  "tasks": [
    {
      "name": "AI Integration",
      "description": "We need to create a integrate AI into our design system for Knapsack.cloud. The design system will be called Toby.",
      "agent": "Product Manager",
      "tools": ["DuckDuckGoSearch"],
      "files": ["1"],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    },
    {
      "name": "AI Research",
      "description": "Conduct a comprehensive analysis of the latest advancements in AI in 2024. Identify key trends, breakthrough technologies, and potential industry impacts. Compile your findings in a detailed report. Your final answer MUST be a full analysis report",
      "agent": "Senior Research",
      "files": ["1"],
      "tools": [],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    },
    {
      "name": "Color Tokens",
      "description": "Lookup colors for knapsack.cloud. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.",
      "agent": "Designer",
      "tools": [],
      "files": ["1"],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    },
    {
      "name": "Create Color Tokens",
      "description": "Create a list of color tokens to represent our design system Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.",
      "agent": "Designer",
      "tools": [],
      "files": ["1"],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    }
  ],
  "files": [
    {
      "name": "Toby Design System",
      "type": "JSON",
      "data": "",
      "metadata": {}
    }
  ],
  "metadata": {},
  "process": "sequential"
}
'
```

## Transcription

mabry1985: @app.route('/transcribe', methods=['POST'])
def transcribe():
agent_payload = request.get_json()
quick = agent_payload.get("quickTranscribe")
if 'file' in request.files:
file = request.files['file']
if file.filename == '':
return jsonify({"error": "No file selected for uploading"}), 400
if file:
filename = secure_filename(file.filename)
filepath = os.path.join('/tmp', filename)
file.save(filepath)

            if quick:
                transcript = quick_transcribe(filepath)
                return jsonify({"title": "", "lite_summary": "", "summary": summary, "transcript": "", "suggested_speakers": ""}), 200

            transcript, suggested_speakers = create_transcript(filepath)
            title, lite_summary, summary = create_title_and_summary(text=transcript)
            return jsonify({"title": title, "lite_summary": lite_summary, "summary": summary, "transcript": transcript, "suggested_speakers": suggested_speakers}), 200

"
Traceback (most recent call last):
File "/home/josh/miniconda3/envs/thecrew/lib/python3.11/site-packages/flask/app.py", line 1455, in wsgi_app
response = self.full_dispatch_request()
^^^^^^^^^^^^^^^^^^^^^^^^^^^^
File "/home/josh/miniconda3/envs/thecrew/lib/python3.11/site-packages/flask/app.py", line 870, in full_dispatch_request
return self.finalize_request(rv)
^^^^^^^^^^^^^^^^^^^^^^^^^
File "/home/josh/miniconda3/envs/thecrew/lib/python3.11/site-packages/flask/app.py", line 889, in finalize_request
response = self.make_response(rv)
^^^^^^^^^^^^^^^^^^^^^^
File "/home/josh/miniconda3/envs/thecrew/lib/python3.11/site-packages/flask/app.py", line 1161, in make_response
raise TypeError(
TypeError: The view function for 'transcribe' did not return a valid response. The function either returned None or ended without a return statement.

GitHub Copilot: The error message is indicating that your `transcribe` function is not always returning a response. This happens when the `if 'file' in request.files:` condition is not met, as there is no `else` clause to handle this case.

To fix this, you should add an `else` clause to return an error message when no file is provided in the request. Here's how you can do it:

```python
@app.route('/transcribe', methods=['POST'])
def transcribe():
    agent_payload = request.get_json()
    quick = agent_payload.get("quickTranscribe")
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected for uploading"}), 400
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join('/tmp', filename)
            file.save(filepath)

            if quick:
                transcript = quick_transcribe(filepath)
                return jsonify({"title": "", "lite_summary": "", "summary": summary, "transcript": "", "suggested_speakers": ""}), 200

            transcript, suggested_speakers = create_transcript(filepath)
            title, lite_summary, summary = create_title_and_summary(text=transcript)
            return jsonify({"title": title, "lite_summary": lite_summary, "summary": summary, "transcript": transcript, "suggested_speakers": suggested_speakers}), 200
    else:
        return jsonify({"error": "No file part in the request"}), 400
```

This way, if no file is provided in the request, the function will return a JSON response with an error message and a 400 status code.

mabry1985: @app.route('/transcribe', methods=['POST'])
def transcribe():
file = None
if 'file' in request.files:
file = request.files['file']
elif 'url' in request.form:
url = request.form['url']
parsed_url = urlparse(url)
filename = os.path.basename(parsed_url.path)
file_extension = os.path.splitext(filename)[1]
audio_extensions = ['.wav', '.mp3', '.flac', '.aac', '.ogg', '.m4a']
if file_extension in audio_extensions:
response = requests.get(url, stream=True)
if response.status_code == 200:
file = response.content
filepath = os.path.join('/tmp', filename)
with open(filepath, 'wb') as f:
f.write(file)
file = type('File', (object,), {'filename': filename})
else:
return jsonify({"error": "Unable to download file from provided URL"}), 400
elif 'youtube.com' in url or 'youtu.be' in url:
audio_data = rip_youtube(url)
filename = 'youtube_audio.mp4'
filepath = os.path.join('/tmp', filename)
with open(filepath, 'wb') as f:
f.write(audio_data.getvalue())
file = type('File', (object,), {'filename': filename})
else:
return jsonify({"error": "Provided URL does not point to a valid audio file or YouTube video"}), 400
if file and file.filename != '':
filename = secure_filename(file.filename)
filepath = os.path.join('/tmp', filename)
if 'file' in request.files:
file.save(filepath)

        if 'quickTranscribe' in request.form:
            transcript = quick_transcribe(audio_file=filepath)
            return jsonify({"transcript": transcript, "src": filename}), 200
        else:
            diarization = request.form.get('diarization', True)
            min_speakers = request.form.get('minSpeakers', 1)
            max_speakers = request.form.get('maxSpeakers', 3)
            file_name = request.form.get('url', filename)
            transcript, suggested_speakers = create_transcript(audio_file=filepath, diarization=diarization, min_speakers=int(min_speakers), max_speakers=int(max_speakers))
            title, lite_summary, summary = create_title_and_summary(text=transcript)

            return jsonify({"title": title, "lite_summary": lite_summary, "summary": summary, "transcript": transcript, "suggested_speakers": suggested_speakers, "src": file_name}), 200
    else:
        return jsonify({"error": "No file or URL provided"}), 400

Now document this endpoint

GitHub Copilot: Here's a brief documentation for the `/transcribe` endpoint:

---

**Endpoint:** `/transcribe`

**Method:** `POST`

**Description:** This endpoint is used to transcribe audio files. It accepts either a file upload or a URL pointing to an audio file or YouTube video.

**Request Parameters:**

- `file`: An audio file to be transcribed. This should be included in the request's files.
- `url`: A URL pointing to an audio file or YouTube video to be transcribed. This should be included in the request's form data.
- `quickTranscribe`: A boolean indicating whether to perform a quick transcription. This should be included in the request's form data.
- `diarization`: A boolean indicating whether to perform speaker diarization. This should be included in the request's form data.
- `minSpeakers`: The minimum number of speakers to consider during diarization. This should be included in the request's form data.
- `maxSpeakers`: The maximum number of speakers to consider during diarization. This should be included in the request's form data.

**Response:**

- If the transcription is successful, the endpoint returns a JSON object containing the transcription, title, summary, lite summary, suggested speakers, and source file name.
- If an error occurs, the endpoint returns a JSON object containing an error message.

**Example Request:**

```bash
curl -X POST -F "file=@audio.wav" -F "quickTranscribe=true" http://localhost:5000/transcribe
```

**Example Response:**

```json
{
  "title": "Transcription Title",
  "lite_summary": "Lite Summary",
  "summary": "Summary",
  "transcript": "Transcription",
  "suggested_speakers": "2",
  "src": "audio.wav"
}
```

**Error Response:**

```json
{
  "error": "No file or URL provided"
}
```

**Notes:**

- The `file` and `url` parameters are mutually exclusive. If both are provided, the `file` parameter will be used.
- If the `quickTranscribe` parameter is set to `true`, the endpoint will return a quick transcription without performing speaker diarization or generating a title and summary.
- The `diarization`, `minSpeakers`, and `maxSpeakers` parameters are only used if the `quickTranscribe` parameter is not set to `true`.
- The endpoint supports `.wav`, `.mp3`, `.flac`, `.aac`, `.ogg`, and `.m4a` audio files, as well as YouTube videos.
