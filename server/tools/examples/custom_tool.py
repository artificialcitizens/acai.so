import json
import requests

from crewai import Agent
from langchain.tools import tool
from unstructured.partition.html import partition_html

class BrowserTools():
  @tool("Scrape website content")
  def scrape_website(website):
    """Useful to scrape a website content"""
    url = f"https://chrome.browserless.io/content?token={config('BROWSERLESS_API_KEY')}"
    payload = json.dumps({"url": website})
    headers = {
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    elements = partition_html(text=response.text)
    content = "\n\n".join([str(el) for el in elements])

    # Return only the first 5k characters
    return content[:5000]


# Create an agent and assign the scrapping tool
agent = Agent(
  role='Research Analyst',
  goal='Provide up-to-date market analysis',
  backstory='An expert analyst with a keen eye for market trends.',
  tools=[BrowserTools().scrape_website]
)