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

# Create a product_manager agent
product_manager = Agent(
  role='Product Manager',
  goal='Orchestrate the team to create the design system, based on the clients needs. You will be provided the goal for the sprint and you will need to create a task list for the team and assign the tasks to the team members.',
  verbose=True,
  backstory=f'''You manage the design system for Knapsack.cloud, It is called Toby.
  You run a small team of highly intelligent designers.
  You are responsible for the overall success of the design system.
  Provide the members of your team with a task list based off of the need of the current sprint.
  ''',
  llm=chat_llm
)

# Create a writer agent
designer = Agent(
  role='Designer',
  goal='Create a design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens',
  verbose=True,
  backstory='A creative soul who translates complex tech jargon into beautiful designs for the masses, you write using simple words in a friendly and inviting tone that does not sounds like AI.',
  llm=chat_llm
)


# Task for the product_manager
product_manager_task = Task(
  description='We need to create a design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens. You can use your team to help you.',
  agent=product_manager  # Assigning the task to the product_manager
)

# # Task for the writer
design_task = Task(
  description='Create a list of color tokens to represent our design system Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.',
  agent=designer  # Assigning the task to the writer
)

# Instantiate your crew
tech_crew = Crew(
  agents=[product_manager, designer],
  tasks=[product_manager_task],
  process=Process.sequential  # Tasks will be executed one after the other
)

def test():
    result = tech_crew.kickoff()
    return result

print(test())