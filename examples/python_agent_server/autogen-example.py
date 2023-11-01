import requests
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from autogen import AssistantAgent, UserProxyAgent, config_list_from_json, Agent

# existing code...
app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "your_secret_key"
CORS(
    app,
    origins=["http://192.168.4.74:5173", "http://localhost:5173", "http://www.acai.so"],
)
socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://192.168.4.74:5173",
        "http://localhost:5173",
        "http://www.acai.so",
    ],
)


def print_messages(recipient, messages, sender, config):
    if "callback" in config and config["callback"] is not None:
        callback = config["callback"]
        callback(sender, recipient, messages[-1])

    last_message = messages[-1]
    content = last_message.get("content", "No content")
    role = last_message.get("role", "No role")

    if "TERMINATE" in content:
        socketio.emit("info-toast", {"info": f"{content} | {role} | {sender.name}"})

    print(
        f"Messages sent to: {recipient.name} | num messages: {len(messages)} | {content} | {role} | {sender.name}"
    )
    return False, None  # required to ensure the agent communication flow continues


# Load LLM inference endpoints from an env variable or a file
# See https://microsoft.github.io/autogen/docs/FAQ#set-your-api-endpoints
# and OAI_CONFIG_LIST_sample.json
config_list = config_list_from_json(
    env_or_file="./OAI_CONFIG_LIST.json", file_location="."
)
assistant = AssistantAgent(
    "assistant", human_input_mode="NEVER", llm_config={"config_list": config_list}
)
user_proxy = UserProxyAgent(
    "user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=1,
    code_execution_config={"work_dir": "coding"},
)
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


@app.route("/test", methods=["GET"])
def test():
    return "Hello world"


@app.route("/autogen", methods=["GET"])
def autogen():
    agent_payload = request.get_json()
    user_message = agent_payload.get("userMessage")
    user_proxy.initiate_chat(assistant, message=user_message)
    return f"Finished autogen process"


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=7050)
