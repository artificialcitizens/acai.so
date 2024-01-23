from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

model = ChatOpenAI(
  openai_api_base="https://api.openai.com/v1",
  openai_api_key=os.getenv("OPENAI_API_KEY"),
)