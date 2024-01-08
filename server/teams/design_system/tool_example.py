import os

from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
load_dotenv()
# You can choose to use a local model through Ollama for example.
# In this case we will use OpenHermes 2.5 as an example.
#
# from langchain.llms import Ollama
# ollama_llm = Ollama(model="openhermes")

# If you are using an ollama like above you don't need to set OPENAI_API_KEY.
os.environ["OPENAI_API_KEY"] = "Your Key"

# Define your tools, custom or not.
# Install duckduckgo-search for this example:
#
# !pip install -U duckduckgo-search

from langchain.tools import DuckDuckGoSearchRun
search_tool = DuckDuckGoSearchRun()
chat_llm = ChatOpenAI(
  base_url='http://192.168.4.192:8080/v1',
  model_name='open-hermes-2.5',
  openai_api_key='sk-xxx'
)

# Define your agents with roles and goals
researcher = Agent(
  role='Senior Research Analyst',
  goal='Uncover cutting-edge developments in AI and data science in',
  backstory="""You are a Senior Research Analyst at a leading tech think tank.
  Your expertise lies in identifying emerging trends and technologies in AI and
  data science. You have a knack for dissecting complex data and presenting
  actionable insights.""",
  verbose=True,
  allow_delegation=False,
  tools=[search_tool],
  llm=chat_llm,
  # (optional) llm=ollama_llm, If you wanna use a local modal through Ollama, default is GPT4 with temperature=0.7

)
writer = Agent(
  role='Tech Content Strategist',
  goal='Craft compelling content on tech advancements',
  backstory="""You are a renowned Tech Content Strategist, known for your insightful
  and engaging articles on technology and innovation. With a deep understanding of
  the tech industry, you transform complex concepts into compelling narratives.""",
  verbose=True,
  # (optional) llm=ollama_llm, If you wanna use a local modal through Ollama, default is GPT4 with temperature=0.7
  allow_delegation=True,
  llm=chat_llm,
)

# Create tasks for your agents
task1 = Task(
  description="""Conduct a comprehensive analysis of the latest advancements in AI in 2024.
  Identify key trends, breakthrough technologies, and potential industry impacts.
  Compile your findings in a detailed report. Your final answer MUST be a full analysis report""",
  agent=researcher
)

task2 = Task(
  description="""Using the insights from the researcher's report, develop an engaging blog
  post that highlights the most significant AI advancements.
  Your post should be informative yet accessible, catering to a tech-savvy audience.
  Aim for a narrative that captures the essence of these breakthroughs and their
  implications for the future. Your final answer MUST be the full blog post of at least 3 paragraphs.""",
  agent=writer
)

# Instantiate your crew with a sequential process
crew = Crew(
  agents=[researcher, writer],
  tasks=[task1, task2],
  verbose=2, # Crew verbose more will let you know what tasks are being worked on, you can set it to 1 or 2 to different logging levels
  process=Process.sequential # Sequential process will have tasks executed one after the other and the outcome of the previous one is passed as extra content into this next.
)

# Get your crew to work!
result = crew.kickoff()

print("######################")
print(result)