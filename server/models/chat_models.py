from env import openai_api_key

model_mapping = {
    "open-hermes-2.5": {
      "base_url": "http://192.168.4.192:8080/v1",
      "model_name": "open-hermes-2.5",
      "openai_api_key": "sk-xxx"
    },
    "gpt-4": {
      "base_url": "https://api.openai.com/v1",
      "model_name": "gpt-4",
      "openai_api_key": openai_api_key
    },
    "gpt-3": {
      "base_url": "https://api.openai.com/v1",
      "model_name": "gpt-3",
      "openai_api_key": openai_api_key
    },
}
