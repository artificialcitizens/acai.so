from embedchain import Pipeline as App
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

rag_bot = App.from_config(config_path="config.yaml")

def add_resource(src, data_type=None):
    if data_type is None:
        rag_bot.add(src)
    else:
        rag_bot.add(src, data_type=data_type)

def add_resources(srcs):
    for src in srcs:
        add_resource(src)

def query_bot(query):
    return rag_bot.query(query)

def wipe_resources():
    rag_bot.reset()
rag_bot.add("./dnd-5e-srd/markdown", data_type="directory")
response = rag_bot.query("list all files in the directory")
print(response)
# # Embed online resources

# # Query the bot

resp = query_bot("What is the charisma modifier?")
print(resp)

