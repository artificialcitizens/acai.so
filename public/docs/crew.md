# Crew Manager

An module for creating and managing [CrewAI](https://github.com/joaomdmoura/crewAI) agents.

## Usage

Setup server environment by following the instructions in the [README.md](/home/josh/dev/acai.so/server/README.md)

## Run ACAI locally

```
git clone https://github.com/artificialcitizens/acai.so
```

```
cd acai.so
```

```
pnpm i
```

```
pnpm run dev
```

Setup your models at `server/models/chat_models.py`

```python
model_mapping = {
    "open-hermes-2.5": {
      # can use custom llm server
      "base_url": "http://192.168.4.192:8080/v1",
      "model_name": "open-hermes-2.5",
      "openai_api_key": "sk-xxx"
    },
    "gpt-4": {
      "base_url": "https://api.openai.com/v1",
      "model_name": "gpt-4",
      "openai_api_key": "sk-xxx"
    }
}


```

Add your custom server to the custom server url settings in the acai interface

Setup your crew by going to settings and the Crew Manager tab
