from flask import Flask, jsonify
from teams.test import test
from socketio import Client

# existing code...
app = Flask(__name__)
sio = Client()
# Create a SocketIO client
sio.connect('http://192.168.4.192:5050')
sio.emit('message', 'Hello from the client!')

@app.route("/example", methods=["POST"])
def agent():
    try:
        response = test()
        # Emit a 'message' event to the server
        sio.emit('message', 'Hello from the client!')
        return jsonify({"response": response}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while processing the payload"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7589)