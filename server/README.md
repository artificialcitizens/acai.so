# ACAI Server

## Usage

Setup local environment:

```
conda create -n ava python=3.10
conda activate ava
conda install -c pytorch faiss-gpu
conda install pytorch==2.0.0 torchaudio==2.0.0 pytorch-cuda=11.8 -c pytorch -c nvidia
pip install -r requirements.txt

```

Run:

```
python main.py
```

### Docker

Use Docker:

```
docker build -t ava .
```

```
docker run -p 5050:5050 ava
```

## Crew Manager

An api for creating and managing [CrewAI](https://github.com/joaomdmoura/crewAI) agents.

<details>
<summary>Curl examples</summary>

```curl
curl  -X POST \
  'http://localhost:5050/run-crew' \
  --header 'Accept: */*' \
  --header 'User-Agent: Thunder Client (https://www.thunderclient.com)' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "agents": [
    {
      "name": "Grant",
      "role": "Product Manager",
      "goal": "Orchestrate the team to create the design system, based on the clients needs. You will be provided the goal for the sprint and you will need to create a task list for the team and assign the tasks to the team members.",
      "backstory": "You manage the design system for Knapsack, It is called Toby. You run a small team of highly intelligent designers. You are responsible for the overall success of the design system. Provide the members of your team with a task list based off of the need of the current sprint.",
      "llm": {
        "base_url": "http://192.168.4.192:8080/v1",
        "model_name": "open-hermes-2.5",
        "openai_api_key": "sk-xxx"
      },
      "tools": ["DuckDuckGoSearch"],
      "files": ["1"],
      "metadata": {},
      "verbose": true,
      "allow_delegation": true
    },
    {
      "role": "Senior Research",
      "name": "Jim",
      "goal": "Research the best way to create a design system for Knapsack.",
      "tools": ["DuckDuckGoSearch"],
      "llm": {
        "base_url": "http://192.168.4.192:8080/v1",
        "model_name": "open-hermes-2.5",
        "openai_api_key": "sk-xxx"
      },
      "files": ["1"],
      "metadata": {},
      "verbose": true,
      "allow_delegation": false
    },
    {
      "name": "Matt",
      "role": "Designer",
      "goal": "Create a design system for Knapsack.",
      "backstory": "A creative soul who translates complex tech jargon into beautiful designs for the masses, you write using simple words in a friendly and inviting tone that does not sounds like AI.",
      "llm": {
        "base_url": "http://192.168.4.192:8080/v1",
        "model_name": "open-hermes-2.5",
        "openai_api_key": "sk-xxx"
      },
      "tools": [],
      "files": ["1"],
      "metadata": {},
      "verbose": true,
      "allow_delegation": true
    }
  ],
  "tasks": [
    {
      "name": "AI Integration",
      "description": "We need to create a integrate AI into our design system for Knapsack.cloud. The design system will be called Toby.",
      "agent": "Product Manager",
      "tools": ["DuckDuckGoSearch"],
      "files": ["1"],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    },
    {
      "name": "AI Research",
      "description": "Conduct a comprehensive analysis of the latest advancements in AI in 2024. Identify key trends, breakthrough technologies, and potential industry impacts. Compile your findings in a detailed report. Your final answer MUST be a full analysis report",
      "agent": "Senior Research",
      "files": ["1"],
      "tools": [],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    },
    {
      "name": "Color Tokens",
      "description": "Lookup colors for knapsack.cloud. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.",
      "agent": "Designer",
      "tools": [],
      "files": ["1"],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    },
    {
      "name": "Create Color Tokens",
      "description": "Create a list of color tokens to represent our design system Toby. Toby is a bear avatar an represents Tobias who came up with the Knapsack problem.",
      "agent": "Designer",
      "tools": [],
      "files": ["1"],
      "metadata": {
        "dueDate": "2021-01-01"
      }
    }
  ],
  "files": [
    {
      "name": "Toby Design System",
      "type": "JSON",
      "data": "",
      "metadata": {}
    }
  ],
  "metadata": {},
  "process": "sequential"
}
'
```

</details>

## Tools

## Google Search

<details>
<summary>Google Search Params</summary>

The possible params options for the GoogleSearchAPIWrapper class's results method are essentially the parameters that can be passed to the Google Custom Search JSON API. These parameters allow you to customize your search query. Here are some of the commonly used parameters:
q: The search query string.
num: Number of search results to return (valid values are integers between 1 and 10, inclusive).
start: The index of the first result to return (for pagination).
lr: Language restrict. Restricts the search to documents written in a particular language (e.g., lang_en for English).
safe: Search safety level (e.g., off, medium, high).
cx: The custom search engine ID to use for this request.
exactTerms: Identifies a phrase that all documents in the search results must contain.
excludeTerms: Identifies a word or phrase that should not appear in any documents in the search results.
fileType: Restricts results to files of a specified extension.
gl: Geolocation of end user.
hl: The interface language (host language) of your user interface.
siteSearch: Specifies all search results should be pages from a given site.
siteSearchFilter: Controls whether to include or exclude results from the site named in the siteSearch parameter.
These parameters are passed as a dictionary to the search_params argument of the results method. For example:
This is not an exhaustive list, and the parameters can change as Google updates its API. For the most current and comprehensive list of parameters, refer to the official documentation of the Google Custom Search JSON API.

</details>
