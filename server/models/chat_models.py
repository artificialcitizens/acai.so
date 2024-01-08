import os
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
load_dotenv()

available_models = [
    {
      "alias": "open-hermes-2.5",
      "base_url": "http://192.168.4.192:8080/v1",
      "model_name": "open-hermes-2.5",
      "openai_api_key": "sk-xxx"
    },
    {
      "alias": "gpt-4",
      "base_url": "https://api.openai.com/v1",
      "model_name": "gpt-4",
      "openai_api_key": "sk-xxx"
    }
  ]

chat_llm = ChatOpenAI(
  base_url='http://192.168.4.192:8080/v1',
  model_name='open-hermes-2.5',
  openai_api_key='sk-xxx'
)
