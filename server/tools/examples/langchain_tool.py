from crewai import Agent
from langchain.agents import Tool
from langchain.utilities import GoogleSerperAPIWrapper

# Initialize SerpAPI tool with your API key
os.environ["OPENAI_API_KEY"] = "Your Key"
os.environ["SERPER_API_KEY"] = "Your Key"

search = GoogleSerperAPIWrapper()

# Create tool to be used by agent
serper_tool = Tool(
  name="Intermediate Answer",
  func=search.run,
  description="useful for when you need to ask with search",
)

# Create an agent and assign the search tool
agent = Agent(
  role='Research Analyst',
  goal='Provide up-to-date market analysis',
  backstory='An expert analyst with a keen eye for market trends.',
  tools=[serper_tool]
)