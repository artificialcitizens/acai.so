from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

import requests
import json
from tools.create_doc import SocketTool

from generator.create_crew import create_crew_from_config
from models.chat_models import model_mapping
from langchain.tools import BaseTool, StructuredTool, tool

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
        "http://192.168.4.192:5173"  # And this line
    ],
)

from langchain.tools import DuckDuckGoSearchRun
from tools.file_system_manager import toolkit


@tool
def create_doc(content: str) -> str:
    """Create a document."""
    socketio.emit(
            "create-tab", {"title": "Hello Tab!", "content": f'Im called by the agent with {content}'}
    )

    return "success"

tool_mapping = {
"DuckDuckGoSearch": DuckDuckGoSearchRun(),
"FileManagementToolkit": toolkit,
"CreateDoc": create_doc,
}

@app.route("/tools", methods=["GET"])
def tools():
    response = []
    for tool in tool_mapping:
        response.append(tool)
    return jsonify({"response": response}), 200

@app.route("/models", methods=["GET"])
def models():
    response = []
    for model in model_mapping:
        response.append(model)
    return jsonify({"response": response}), 200

@app.route("/run-crew", methods=["POST"])
def create_crew():
    # import io   
    # import contextlib
    # def capture_output():
    
    #     buffer = io.StringIO()
    #     with contextlib.redirect_stdout(buffer):
    #         crew.kickoff()
    #     return buffer.getvalue()

    try:
        payload = request.get_json()
        config_string = json.dumps(payload)
        crew = create_crew_from_config(config_string, tool_mapping)
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
