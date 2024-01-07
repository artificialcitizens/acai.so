import json
from crewai import Agent, Task, Crew, Process
from langchain_community.chat_models import ChatOpenAI

def create_crew_from_config(config_string, tool_mapping):
    config = json.loads(config_string)

    # Create the ChatOpenAI objects
    llms = {}
    for agent_config in config["agents"]:
        llm_config = agent_config.pop("llm")
        llm_key = f"{llm_config['base_url']}_{llm_config['model_name']}"
        if llm_key not in llms:
            llms[llm_key] = ChatOpenAI(**llm_config)
        agent_config["llm"] = llms[llm_key]

        # Create the tools
        if "tools" in agent_config:
            agent_config["tools"] = [tool_mapping[tool_name] for tool_name in agent_config["tools"]]

    # Create the Agent objects
    agents = {agent_config["role"]: Agent(**agent_config) for agent_config in config["agents"]}

    # Create the Task objects
    tasks = []
    for task_config in config["tasks"]:
        task_config = task_config.copy()
        agent_role = task_config.pop("agent")
        if agent_role not in agents:
            raise Exception(f"No agent found with role '{agent_role}'")
        if "tools" in task_config:
            task_config["tools"] = [tool_mapping[tool_name] for tool_name in task_config["tools"]]
        tasks.append(Task(agent=agents[agent_role], **task_config))

    # Create the Crew object
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process[config["process"]]
    )

    return crew

# Example usage
if __name__ == "__main__":
    from langchain.tools import DuckDuckGoSearchRun


    config_string = """
{
    "agents": [
        {
            "role": "Product Manager",
            "goal": "Orchestrate the team to create the design system, based on the clients needs. You will be provided the goal for the sprint and you will need to create a task list for the team and assign the tasks to the team members.",
            "verbose": true,
            "backstory": "You manage the design system for Knapsack.cloud, It is called Toby. You run a small team of highly intelligent designers. You are responsible for the overall success of the design system. Provide the members of your team with a task list based off of the need of the current sprint.",
            "llm": {
                "base_url": "http://192.168.4.192:8080/v1",
                "model_name": "open-hermes-2.5",
                "openai_api_key": "sk-xxx"
            }
        },
        {
            "role": "Senior Research",
            "goal": "Research the best way to create a design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens",
            "backstory": "You are a Senior Research Analyst at a leading tech think tank. Your expertise lies in identifying emerging trends and technologies in AI and design systems. You have a knack for dissecting complex data and presenting actionable insights.",
            "verbose": true,
            "allow_delegation": false,
            "tools": ["DuckDuckGoSearch"],
            "llm": {
                "base_url": "http://192.168.4.192:8080/v1",
                "model_name": "open-hermes-2.5",
                "openai_api_key": "sk-xxx"
            }
        },
        {
            "role": "Designer",
            "goal": "Create a design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens",
            "verbose": true,
            "backstory": "A creative soul who translates complex tech jargon into beautiful designs for the masses, you write using simple words in a friendly and inviting tone that does not sounds like AI.",
            "llm": {
                "base_url": "http://192.168.4.192:8080/v1",
                "model_name": "open-hermes-2.5",
                "openai_api_key": "sk-xxx"
            }
        }
    ],
    "tasks": [
        {
            "description": "We need to create a integrate AI into our design system for Knapsack.cloud. The design system will be called Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem. Lets start by creating a set of design tokens. You can use your team to help you.",
            "agent": "Product Manager"
        },
        {
            "description": "Conduct a comprehensive analysis of the latest advancements in AI in 2024. Identify key trends, breakthrough technologies, and potential industry impacts. Compile your findings in a detailed report. Your final answer MUST be a full analysis report",
            "agent": "Senior Research"
        },
        {
            "description": "Lookup colors for knapsack.cloud. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.",
            "agent": "Designer",
            "tools": ["DuckDuckGoSearch"]
        },
        {
            "description": "Create a list of color tokens to represent our design system Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.",
            "agent": "Designer"
        }
    ],
    "process": "sequential"
}
"""

    tool_mapping = {
    "DuckDuckGoSearch": DuckDuckGoSearchRun()
    }
     # Add your tools here
    crew = create_crew_from_config(config_string, tool_mapping)
    result = crew.kickoff()
    print(result)