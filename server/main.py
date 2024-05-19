from threading import Event
import requests
import json

from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from flask import Flask, request
# from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"

CORS(
    app,
    origins=[
        "http://192.168.4.74:5173", 
        "http://localhost:5173", 
        "http://www.acai.so",
        "http://192.168.4.195:5173",
        "http://192.168.4.192:5173" 
        "http://192.168.4.74:4173", 
        "http://localhost:4173", 
        "http://www.acai.so",
        "http://192.168.4.195:4173",
        "http://192.168.4.192:4173" 
        "http://172.23.0.3:4173"
    ],
)

socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://192.168.4.74:5173",  
        "http://localhost:5173",
        "https://www.acai.so",
        "http://192.168.4.195:5173",
        "http://192.168.4.192:5173"
        "http://192.168.4.74:4173",  
        "http://localhost:4173",
        "https://www.acai.so",
        "http://192.168.4.195:4173",
        "http://192.168.4.192:4173"
        "http://172.23.0.3:4173"
    ],
)

@socketio.on('flask_server_message')
def handle_message(message):
    print('Received message: ' + message)
    socketio.emit('relay_message', {'data': message})

####################
# TOOLS
####################
import yaml

from langchain.tools import BaseTool, StructuredTool, tool
from langchain.agents import load_tools, Tool
from langchain_experimental.utilities import PythonREPL
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.utilities import GoogleSearchAPIWrapper
# from tools.summarization.summary_and_title import create_title_and_summary
from tools.loaders.github import load_github_trending
from tools.loaders.weather import get_weather
from tools.loaders.wiki_search import wiki_search

google_api_key = os.getenv("GOOGLE_API_KEY")
google_cse_id = os.getenv("GOOGLE_CSE_ID")

search = GoogleSearchAPIWrapper(
    google_api_key=google_api_key,
    google_cse_id=google_cse_id
)

def google_results(query: str, num_results: int, search_params: dict) -> str:
    results = search.results(query, num_results, search_params)
    return results

def parse_search_results(results: dict) -> str:
    '''
    Convert search results to a yaml string
    '''
    return yaml.dump(results, allow_unicode=True, default_flow_style=False)

@tool
def agent_google_search(query: str) -> str:
    """Search Google for recent results."""
    results = search.results(query, num_results=5, search_params={})
    return parse_search_results(results)

@tool
def wiki_search_tool(query: str) -> str:
    """Search Wikipedia for the query. Input is the query to search for."""
    try:
        results = wiki_search(query=query)
        return results[0]
    except Exception as error:
        return jsonify({"error": str(error)}), 500

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

    # Wait for the event or timeout after 15 seconds
    response_received.wait(timeout=15)

    if not response_received.is_set():
        print('timeout')
        return 'Timeout waiting for response'

    return response_data.get('response', 'No response received')

from tools.web_scraper.bs_scraper import scrape_html

@tool
def get_request(url: str) -> str:
    """A portal to the internet. Use this when you need to get specific content from a website. Input should be a  url (i.e. https://www.google.com). The output will be the text response of the GET request"""
    try:
        response = requests.get(url, timeout=5)
        return scrape_html(response.text)
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@tool
def python_repl_tool(content: str) -> str:
    """A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`."""
    python_repl = PythonREPL()
    return python_repl.run(content)

tool_mapping = {
    "GoogleSearch": agent_google_search,
    "Requests": get_request,
    "CreateDoc": create_doc,
    "HumanInTheLoop": human_in_the_loop,
    "PythonREPL": python_repl_tool,
    "GetGithubTrending": get_github_trending,
    "GetWeather": get_weather_tool,
    "WikiSearch": wiki_search_tool,
}

from models.crew_config import model_mapping
from ac_crew.create_crew import create_crew_from_config

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
    
@app.route("/search", methods=["GET"])
def google_search():
    """
Perform a Google search using the provided query and optional parameters.

Query Parameters:
- q (required): The search query string.
- num (optional): The number of search results to return (default: 10, max: 10).
- lr (optional): Language restrict (e.g., 'lang_en' for English).
- safe (optional): Search safety level (e.g., 'off', 'medium', 'high').
- exactTerms (optional): Phrase that all documents in the search results must contain.
- excludeTerms (optional): Word or phrase that should not appear in any documents in the search results.
- fileType (optional): Restricts results to files of a specified extension.
- gl (optional): Geolocation of end user.
- hl (optional): The interface language (host language) of your user interface.
- siteSearch (optional): Specifies all search results should be pages from a given site.
- siteSearchFilter (optional): Controls whether to include or exclude results from the site named in the siteSearch parameter.
- dateRestrict (optional): Restricts results to a specific date range (e.g., 'd1' for the past 24 hours, 'd2' for the past 48 hours, 'w1' for the past 7 days, 'm1' for the past 30 days, 'y1' for the past year).

Returns:
- JSON object containing the search results.
- 200 status code on success.
- 500 status code on error, with an error message in the JSON response.

Example:
GET /search?q=Python+programming&num=5&lr=lang_en&safe=high

Response:
{
    "results": [
        {
            "title": "Python Programming Language",
            "link": "https://www.python.org/",
            "snippet": "Python is a programming language that lets you work quickly and integrate systems more effectively."
        },
        ...
    ]
}
"""
    try:
        query = request.args.get("q")
        num_results = int(request.args.get("num", 10))
        
        search_params = {
            "lr": request.args.get("lr", ""),
            "safe": request.args.get("safe", ""),
            "exactTerms": request.args.get("exactTerms", ""),
            "excludeTerms": request.args.get("excludeTerms", ""),
            "fileType": request.args.get("fileType", ""),
            "gl": request.args.get("gl", ""),
            "hl": request.args.get("hl", ""),
            "siteSearch": request.args.get("siteSearch", ""),
            "siteSearchFilter": request.args.get("siteSearchFilter", ""),
            "dateRestrict": request.args.get("dateRestrict", "")
        }

        # strip out any empty search params
        search_params = {k: v for k, v in search_params.items() if v}
        print('search params -------------------')
        print(search_params)
        results = search.results(query, num_results, search_params)
        return jsonify({"results": results}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500

@app.route("/test", methods=["GET"])
def test():
    return jsonify({"response": "Hello World!"}), 200

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050, allow_unsafe_werkzeug=True)
