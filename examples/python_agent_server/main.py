from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

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

        return jsonify({"response": "Hello from the server side..."}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while processing the payload"}), 500


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050)
