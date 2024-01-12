import json
from crewai import Task, Crew, Process
from langchain_community.chat_models import ChatOpenAI
from models.chat_models import model_mapping
from agents.custom_agent import ExtendedAgent

def create_crew_from_config(config_string, tool_mapping, socketio):
    try:
        config = json.loads(config_string)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in config_string")

    llms = {}
    for agent_config in config.get("agents", []):
        try:
            llm = agent_config.pop("llm")
            llm_config = model_mapping[llm]
            llm_key = f"{llm_config['base_url']}_{llm_config['model_name']}"
            if llm_key not in llms:
                llms[llm_key] = ChatOpenAI(**llm_config)
            agent_config["llm"] = llms[llm_key]
        except KeyError as e:
            raise ValueError(f"Missing key in agent_config: {e}")

        agent_config.pop("id", None)

        if "tools" in agent_config:
            try:
                agent_config["tools"] = [tool_mapping[tool_name] for tool_name in agent_config["tools"]]
            except KeyError as e:
                raise ValueError(f"Tool not found in tool_mapping: {e}")

    agents = {}
    for agent_config in config.get("agents", []):
        try:
            agents[agent_config["role"]] = ExtendedAgent(**agent_config, socketio=socketio)
        except KeyError as e:
            raise ValueError(f"Missing key in agent_config: {e}")

    tasks = []
    for task_config in config.get("tasks", []):
        try:
            agent_role = task_config.pop("agent")
            if agent_role not in agents:
                raise Exception(f"No agent found with role '{agent_role}'")
            task_config.pop("id", None)
            if "tools" in task_config:
                task_config["tools"] = [tool_mapping[tool_name] for tool_name in task_config["tools"]]
            tasks.append(Task(agent=agents[agent_role], **task_config))
        except KeyError as e:
            raise ValueError(f"Missing key in task_config: {e}")

    try:
        crew = Crew(
            agents=list(agents.values()),
            tasks=tasks,
            process=Process[config["process"]]
        )
    except KeyError as e:
        raise ValueError(f"Missing key in config: {e}")

    return crew