from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not set")

model = ChatOpenAI(
  openai_api_base="http://127.0.0.1:8080/v1",
  # openai_api_base="https://api.openai.com/v1",
  openai_api_key=os.getenv("OPENAI_API_KEY"),
)