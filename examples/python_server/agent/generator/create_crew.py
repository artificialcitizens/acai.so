import json
from crewai import Agent, Task, Crew, Process
from langchain_community.chat_models import ChatOpenAI
from langchain.tools import DuckDuckGoSearchRun

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

    import json
    
    # open example.json
    with open("/home/josh/dev/acai.so/examples/python_server/agent/generator/example.json") as f:
        config_string = f.read()
    
    tool_mapping = {
    "DuckDuckGoSearch": DuckDuckGoSearchRun()
    }
     # Add your tools here
    crew = create_crew_from_config(config_string, tool_mapping)
    result = crew.kickoff()
    print(result)