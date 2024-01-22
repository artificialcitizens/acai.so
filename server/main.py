from threading import Event
import requests
import json

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"

CORS(
    app,
    origins=[
        "http://192.168.4.74:5173", 
        "http://localhost:5173", 
        "http://www.acai.so",
        "http://192.168.4.192:5173"  # Add this line
    ],
)

socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://192.168.4.74:5173",
        "http://localhost:5173",
        "https://www.acai.so",
        "http://192.168.4.192:5173"
    ],
)

####################
# TOOLS
####################
from langchain.tools import BaseTool, StructuredTool, tool
from langchain.agents import load_tools, Tool
from langchain_experimental.utilities import PythonREPL
from langchain_community.utilities import TextRequestsWrapper
from langchain_community.tools import DuckDuckGoSearchRun
from tools.file_system_manager import file_manager_toolkit, get_file_tool
from tools.web_scraper.loaders.github import load_github_trending
from tools.loaders.weather import get_weather

@tool
def get_weather_tool(zip_code: str) -> str:
    """Get the weather for a zip code. Input is a zip code."""
    try:
        page = get_weather(zip_code=zip_code)
        return page
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@tool
def get_github_trending(query: str) -> str:
    """Get the trending repositories from GitHub, no input required."""
    try:
        page = load_github_trending()
        return page
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@tool
def create_doc(content: str) -> str:
    """Create and send a document to the user. Input is a string"""
    socketio.emit(
            "create-tab", {"title": "Crew Message", "content": f'{content}'}
    )

    return "success"
# ----

# Human in the loop
response_data = {}
response_received = Event()

@socketio.on('human-in-the-loop-response')
def handle_human_in_the_loop(json):
    print('received json: ' + str(json))
    response_data['response'] = json
    response_received.set()

@tool
def human_in_the_loop(content: str) -> str:
    """Ask the user for input. Input is your question to the user"""
    response_received.clear()
    socketio.emit("human-in-the-loop", {"question": f'{content}'})

    # Wait for the event or timeout after 10 seconds
    response_received.wait(timeout=15)

    if not response_received.is_set():
        print('timeout')
        return 'Timeout waiting for response'

    return response_data.get('response', 'No response received')

@tool
def get_request(url: str) -> str:
    """A portal to the internet. Use this when you need to get specific content from a website. Input should be a  url (i.e. https://www.google.com). The output will be the text response of the GET request"""
    url = request.args.get("url")
    try:
        response = requests.get(url, timeout=5)
        return response.text
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@tool
def python_repl_tool(content: str) -> str:
    """A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`."""
    python_repl = PythonREPL()
    return python_repl.run(content)


tool_mapping = {
    "DuckDuckGoSearch": DuckDuckGoSearchRun(),
    "Requests": get_request,
    "CreateDoc": create_doc,
    "HumanInTheLoop": human_in_the_loop,
    "PythonREPL": python_repl_tool,
    "GetGithubTrending": get_github_trending,
    "GetWeather": get_weather_tool,
    # uses a temporary directory currently
    # "CopyFileTool": get_file_tool(file_manager_toolkit, 'copy_file'),
    # "DeleteFileTool": get_file_tool(file_manager_toolkit, 'file_delete'),
    # "SearchFileTool": get_file_tool(file_manager_toolkit, 'file_search'),
    # "MoveFileTool": get_file_tool(file_manager_toolkit, 'move_file'),
    # "ReadFileTool": get_file_tool(file_manager_toolkit, 'read_file'),
    # "WriteFileTool": get_file_tool(file_manager_toolkit, 'write_file'),
    # "ListFilesTool": get_file_tool(file_manager_toolkit, 'list_directory'),
}

from models.crew_config import model_mapping
from crew.create_crew import create_crew_from_config

@app.route("/tools", methods=["GET"])
def tools():
    response = []
    for tool in tool_mapping:
        response.append(tool)
    return jsonify({"response": response}), 200

@app.route("/models", methods=["GET"])
def models():
    response = list(model_mapping.keys())
    return jsonify({"response": response}), 200

@app.route("/run-crew", methods=["POST"])
def create_crew():
    try:
        payload = request.get_json()
        config_string = json.dumps(payload)
        print('config string -------------------')
        print(config_string)
        crew = create_crew_from_config(config_string, tool_mapping, socketio)
        print('crew created')
        response = crew.kickoff()
        # output = capture_output()
        # print(output)
        return jsonify({"response": response, "status": "success"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": str(e)}), 500

# Forwards the request to input URL and returns the response
@app.route("/proxy", methods=["GET"])
def proxy():
    try:
        url = request.args.get("url")
        response = requests.get(url, timeout=5)
        return response.text
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@app.route("/test", methods=["GET"])
def test():
    return jsonify({"response": "Hello World!"}), 200

@app.route("/v1/agent", methods=["POST"])
def agent():
    try:
        agent_payload = request.get_json()

        print("Agent Payload:", agent_payload)

        user_message = agent_payload.get("userMessage")
        user_name = agent_payload.get("userName")
        user_location = agent_payload.get("userLocation")
        custom_prompt = agent_payload.get("customPrompt")
        chat_history = agent_payload.get("chatHistory")
        current_document = agent_payload.get("currentDocument")

        formatted_payload = f"I'm a tab from the custom agent endpoint! 👍\
            \nUser Message: {user_message}\
            \nUser Name: {user_name}\
            \nUser Location: {user_location}\
            \nCustom Prompt: {custom_prompt}\
            \nChat History: {chat_history}\
            \nCurrent Document: {current_document}\
            "

        socketio.emit(
            "create-tab", {"title": "Hello Tab!", "content": formatted_payload}
        )
        socketio.emit(
            "info-toast", {"info": "We are sending a toast from the server side!"}
        )

        return jsonify({"response": "Hello from the server side..."}), 200

    except Exception as e:
        print(e)
        return jsonify


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050, allow_unsafe_werkzeug=True)
