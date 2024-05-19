## Transcription

### Setup

#### Manual

`conda create -n whisperx python=3.10`

`conda activate whisperx`

`conda install pytorch==2.0.0 torchaudio==2.0.0 pytorch-cuda=11.8 -c pytorch -c nvidia`

`sudo apt update && sudo apt install ffmpeg`

`pip install setuptools-rust`

`pip install git+https://github.com/m-bain/whisperx.git`

`pip install -U openai-whisper`

`pip install flask`

`pip install pytube`

`pip install python-dotenv`

`python transcription.py`

#### Docker

`docker build -f transcription.Dockerfile -t transcription-service .`

Set the path to the .env file for the docker container using env.example as a reference.

`docker run --env-file /path/to/acai.so/server/.env -it --gpus all -p 5051:5051 transcription-service`

## Speaker Diarization

If you want to use speaker diariazation you need to provide your HuggingFace API key and visit the models pages to enable the models to be downloaded

More info [here](https://github.com/m-bain/whisperX?tab=readme-ov-file#speaker-diarization)

---

**Endpoint:** `/transcribe`

**Method:** `POST`

**Description:** This endpoint is used to transcribe audio files. It accepts either a file upload or a URL pointing to an audio file or YouTube video.

**Request Parameters:**

- `file`: An audio file to be transcribed. This should be included in the request's files.
- `url`: A URL pointing to an audio file or YouTube video to be transcribed. This should be included in the request's form data.
- `diarization`: A boolean indicating whether to perform speaker diarization. This should be included in the request's form data.
- `minSpeakers`: The minimum number of speakers to consider during diarization. This should be included in the request's form data.
- `maxSpeakers`: The maximum number of speakers to consider during diarization. This should be included in the request's form data.

**Response:**

- If the transcription is successful, the endpoint returns a JSON object containing the transcription, title, summary, lite summary, suggested speakers, and source file name.
- If an error occurs, the endpoint returns a JSON object containing an error message.

**Example Request:**

```bash
curl -X POST -F "file=@audio.wav" http://localhost:5051/transcribe
```

```bash
curl  -X POST \
  'http://127.0.0.1:5051/transcribe' \
  --header 'Accept: */*' \
  --form 'url="https://www.youtube.com/watch?v=12jdFZrh8j4"' \
  --form 'diarization="True"' \
  --form 'minSpeakers="1"' \
  --form 'maxSpeakers="3"'
```

**Example Response:**

```json
{
  "transcript": "Transcription",
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
- The endpoint supports `.wav`, `.mp3`, `.flac`, `.aac`, `.ogg`, and `.m4a` audio files, as well as YouTube videos.
