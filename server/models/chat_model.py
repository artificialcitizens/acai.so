from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not set")

baseUrl = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

model = ChatOpenAI(
  openai_api_base=baseUrl,
  # openai_api_base="https://api.openai.com/v1",
  openai_api_key=os.getenv("OPENAI_API_KEY"),
  model_name=model_name,
)

