import whisperx
import gc
import os
import time
from dotenv import load_dotenv
import torch

# Load environment variables at the start
load_dotenv()

# Preload Whisper model
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "distil-medium.en")
device = "cuda"  # or "cpu", depending on your setup
compute_type = "float16"  # Adjust as needed
# Ensure the Whisper model is downloaded
print('Loading Whisper model...')
whisperx.load_model(WHISPER_MODEL, device, compute_type=compute_type)

# Preload Diarization model if HUGGINGFACE_API_KEY is set
HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY")
if HF_TOKEN:
    # This will trigger the download of the diarization model if not already downloaded
    try:
        print('Loading Diarization model...')
        whisperx.DiarizationPipeline(use_auth_token=HF_TOKEN, device=device)
    except Exception as e:
        print(f"Error preloading Diarization model: {e}")

def transcribe_audio(
        audio,
        device="cuda",
        batch_size=16,
        compute_type="float16",
        diarization=False,
        min_speakers=1,
        max_speakers=2
        ):
    '''Transcribe audio with optional diarization.

    @see https://github.com/m-bain/whisperX
    '''
    transcribe_function_start_time = time.time()
    load_dotenv()

    # Use the preloaded Whisper model
    WHISPER_MODEL = os.getenv("WHISPER_MODEL", "distil-medium.en")
    model = whisperx.load_model(WHISPER_MODEL, device, compute_type=compute_type)

    print("Transcribing audio...")
    transcribe_start_time = time.time()
    result = model.transcribe(audio, batch_size=batch_size)
    print(f"Transcribed audio in {time.time() - transcribe_start_time} seconds")
    # delete model if low on GPU resources
    del model
    gc.collect()
    torch.cuda.empty_cache()

    if not diarization:
        return result["segments"]
    print("Diarizing audio...")
    diarization_start_time = time.time()
    # Use the preloaded Diarization model
    diarize_model = whisperx.DiarizationPipeline(use_auth_token=os.getenv("HUGGINGFACE_API_KEY"), device=device)

    # add min/max number of speakers if known
    diarize_segments = diarize_model(audio, min_speakers=min_speakers, max_speakers=max_speakers)
    result = whisperx.assign_word_speakers(diarize_segments, result)
    print(f"Diarized audio in {time.time() - diarization_start_time} seconds")
    print(f"Completed audio transcription in {time.time() - transcribe_function_start_time} seconds")
    
    del diarize_model
    gc.collect()
    torch.cuda.empty_cache()

    return result["segments"]

def format_transcript(segments):
    # Initialize formatted segments list
    formatted_segments = []
    
    if not segments:
        return formatted_segments

    # Initialize the first speaker and words list
    current_speaker = segments[0].get('speaker', 'Unknown')
    current_words = []
    start_time = segments[0].get('start', 0)
    
    # Process each segment
    for segment in segments:
        speaker = segment.get('speaker', 'Unknown')
        text = segment.get('text', '')
        segment_start = segment.get('start', 0)
        
        # Check if the current segment continues with the same speaker
        if speaker == current_speaker:
            # Continue accumulating the words
            current_words.append(text)
        else:
            # Speaker changed, format the previous speaker's segment
            sentence = f"""[{start_time}] - {speaker}:
    {' '.join(current_words)}"""
            formatted_segments.append(sentence)
            
            # Update speaker and reset the words list
            current_speaker = speaker
            current_words = [text]
            start_time = segment_start

    # Add the last accumulated segment after the loop
    sentence = f"""[{start_time}] - {current_speaker}:
{' '.join(current_words)}"""
    formatted_segments.append(sentence)

    return formatted_segments

def format_time(seconds):
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}"

def transcribe_audio_file(audio_file, diarization=False, min_speakers=1, max_speakers=2):
    '''Transcribe audio file and return a list of sentences'''
    audio = whisperx.load_audio(audio_file)
    segments = transcribe_audio(audio=audio, diarization=diarization, min_speakers=min_speakers, max_speakers=max_speakers)
    transcript_list = format_transcript(segments)
    return transcript_list

def create_transcription_text(transcript_list):
    '''Create a transcription from a list of sentences'''
    return '\n\n'.join(transcript_list)

def quick_transcribe(audio_file):
    '''Transcribe audio and return a chunk of text'''
    segments = transcribe_audio_file(audio_file=audio_file)
    print(segments)
    # combined_text = ' '.join([segment['text'] for segment in segments])
    return segments[0]

def create_transcript(audio_file, min_speakers=1, max_speakers=3):
    '''Create a transcript from an audio file'''
    transcript_list = transcribe_audio_file(audio_file, diarization=True, min_speakers=min_speakers, max_speakers=max_speakers)
    transcript = create_transcription_text(transcript_list)
    return transcript

if __name__ == "__main__":

    audio_file="/home/josh/dev/acai.so/server/tools/audio/example.wav"
    output_dir = './data/files/test'
    output_file = 'example-transcript.txt'
    
    transcript_list = transcribe_audio_file(audio_file=audio_file, diarization=True, min_speakers=1, max_speakers=3)
    
    # For testing if llm can infer names for speakers
    sample_list = transcript_list[:10]
    print('Infering speakers for sample list')
    
    
    # Create directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Write transcript to file
    transcript = create_transcription_text(transcript_list)

    with open(os.path.join(output_dir, output_file), 'w') as f:
        f.write(transcript)