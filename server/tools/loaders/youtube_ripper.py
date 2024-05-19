# from langchain_community.document_loaders.blob_loaders.youtube_audio import (
#     YoutubeAudioLoader,
# )
# from langchain_community.document_loaders.generic import GenericLoader
# from langchain_community.document_loaders.parsers import (
#     OpenAIWhisperParser,
# )
# from dotenv import load_dotenv
# import os

# load_dotenv()
# local = False

# urls = ["https://youtu.be/kCc8FmEb1nY", "https://youtu.be/VMj-3S1tku0"]

# save_dir = "~/Downloads/YouTube"

# if local:
#     # loader = GenericLoader(
#     #     YoutubeAudioLoader(urls, save_dir), OpenAIWhisperParserLocal()
#     # )
#     pass
# else:
#     loader = GenericLoader(YoutubeAudioLoader(urls, save_dir), OpenAIWhisperParser())
# docs = loader.load()

# # Returns a list of Documents, which can be easily viewed or parsed
# print(docs[0].page_content[0:500])

import pytube
import io
import os


def rip_youtube(url):
    video = pytube.YouTube(url)
    audio = video.streams.get_audio_only()

    # Download the audio file using a temporary name
    temp_filename = "temp_download_audio.mp4"
    audio.download(filename=temp_filename)

    # Read the downloaded file into a BytesIO buffer
    with open(temp_filename, "rb") as temp_file:
        audio_data = temp_file.read()

    # Remove the temporary file
    os.remove(temp_filename)

    # Create and return a BytesIO object
    return io.BytesIO(audio_data)