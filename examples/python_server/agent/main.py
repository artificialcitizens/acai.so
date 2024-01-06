from flask import Flask, jsonify
from teams.test import test

# existing code...
app = Flask(__name__)

@app.route("/example", methods=["POST"])
def agent():
    try:
        response = test()
        return jsonify({"response": response}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred while processing the payload"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7589)
