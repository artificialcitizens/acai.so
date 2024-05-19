import os
from crewai import Agent
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
load_dotenv()

chat_llm = ChatOpenAI(
  base_url='http://192.168.4.192:8080/v1',
  model_name='open-hermes-2.5',
  openai_api_key='sk-xxx'
)

# Create a researcher agent
researcher = Agent(
  role='Senior Researcher',
  goal='Discover groundbreaking technologies',
  verbose=True,
  backstory='A curious mind fascinated by cutting-edge innovation and the potential to change the world, you know everything about tech.',
  llm=chat_llm
)

# Create a writer agent
writer = Agent(
  role='Writer',
  goal='Craft compelling stories about tech discoveries',
  verbose=True,
  backstory='A creative soul who translates complex tech jargon into engaging narratives for the masses, you write using simple words in a friendly and inviting tone that does not sounds like AI.',
  llm=chat_llm
)

from crewai import Task

# Task for the researcher
research_task = Task(
  description='Identify the next big trend in AI',
  agent=researcher  # Assigning the task to the researcher
)

# Task for the writer
write_task = Task(
  description='Write an article on AI advancements leveraging the research made.',
  agent=writer  # Assigning the task to the writer
)

from crewai import Crew, Process

# Instantiate your crew
tech_crew = Crew(
  agents=[researcher, writer],
  tasks=[research_task, write_task],
  process=Process.sequential  # Tasks will be executed one after the other
)

def test():
    result = tech_crew.kickoff()
    return result