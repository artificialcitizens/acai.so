# ACAI Server

## Usage

Setup local environment:

```
conda create -n ava python=3.10
conda activate ava
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
