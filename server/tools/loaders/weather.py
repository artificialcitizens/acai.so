from langchain_community.document_loaders import WeatherDataLoader

from dotenv import load_dotenv
import os

load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")

def get_weather(zip_code: str):
    loader = WeatherDataLoader.from_params(
        [zip_code], openweathermap_api_key=OPENWEATHERMAP_API_KEY
    )
    documents = loader.load()
    return documents[0].page_content

if __name__ == "__main__":
    print(get_weather("97230"))