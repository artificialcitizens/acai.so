from chains.speaker_inference import infer_speakers
from tools.audio.whisperx_transcription import transcribe_audio_file, create_transcription

def create_transcript(audio_file):
    '''Create a transcript from an audio file'''
    transcript_list = transcribe_audio_file(audio_file, diarization=True, min_speakers=1, max_speakers=3)
    transcript = create_transcription(transcript_list)
    sample_list = transcript_list[:10]
    suggested_speakers = infer_speakers('\n\n'.join(sample_list))
    return transcript, suggested_speakers

if __name__ == "__main__":
    audio_file="/home/josh/dev/acai.so/server/tools/audio/dsp-96.mp3"
    output_dir = './data/files/test/dsp-transcripts'
    output_file = 'dsp-96-transcript.txt'
    
    transcript, suggested_speakers = create_transcript(audio_file)

    print(transcript)
    print(suggested_speakers)