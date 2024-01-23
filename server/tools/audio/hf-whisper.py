import torch
from transformers import pipeline
from transformers.utils import is_flash_attn_2_available

def transcribe_audio(audio_data):
    pipe = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-large-v3", # select checkpoint from https://huggingface.co/openai/whisper-large-v3#model-details
        torch_dtype=torch.float16,
        device="cuda:0", # or mps for Mac devices
        model_kwargs={"attn_implementation": "flash_attention_2"} if is_flash_attn_2_available() else {"attn_implementation": "sdpa"},
    )

    outputs = pipe(
        audio_data,
        chunk_length_s=30,
        batch_size=24,
        return_timestamps=True,
    )

    return outputs

if __name__ == "__main__":
    import soundfile as sf
    import time
    audio_data, samplerate = sf.read("/home/josh/dev/acai.so/server/tools/audio/dsp-96.mp3")
    print("Transcribing audio...")
    transcribe_start_time = time.time()
    outputs = transcribe_audio(audio_data)
    print(f"Transcribed audio in {time.time() - transcribe_start_time} seconds")
    print(outputs)