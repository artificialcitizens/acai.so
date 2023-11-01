from autogen import AssistantAgent, UserProxyAgent, config_list_from_json, Agent


def print_messages(recipient, messages, sender, config):
    if "callback" in config and config["callback"] is not None:
        callback = config["callback"]
        callback(sender, recipient, messages[-1])
    print(f"Messages sent to: {recipient.name} | num messages: {len(messages)}")
    return False, None  # required to ensure the agent communication flow continues


# Load LLM inference endpoints from an env variable or a file
# See https://microsoft.github.io/autogen/docs/FAQ#set-your-api-endpoints
# and OAI_CONFIG_LIST_sample.json
config_list = config_list_from_json(
    env_or_file="./OAI_CONFIG_LIST.json", file_location="."
)
assistant = AssistantAgent("assistant", llm_config={"config_list": config_list})
user_proxy = UserProxyAgent("user_proxy", code_execution_config={"work_dir": "coding"})
user_proxy.register_reply(
    [Agent, None],
    reply_func=print_messages,
    config={"callback": None},
)

assistant.register_reply(
    [Agent, None],
    reply_func=print_messages,
    config={"callback": None},
)
user_proxy.initiate_chat(
    assistant, message="Create a graph charting the sequence of pi"
)
# This initiates an automated chat between the two agents to solve the task
