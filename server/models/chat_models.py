import os
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
load_dotenv()

chat_llm = ChatOpenAI(
  base_url='http://192.168.4.192:8080/v1',
  model_name='open-hermes-2.5',
  openai_api_key='sk-xxx'
)
