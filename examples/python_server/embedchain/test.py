from embedchain import Pipeline as App
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

rag_bot = App.from_config(config_path="config.yaml")

def add_resource(url):
    rag_bot.add(url)

def query_bot(query):
    return rag_bot.query(query)

# # Embed online resources
# add_resource("https://en.wikipedia.org/wiki/Elon_Musk")
# add_resource("https://www.forbes.com/profile/elon-musk")

# # Query the bot
resp = query_bot("What is the name of all the companies that Elon Musk runs?")

print(resp)

