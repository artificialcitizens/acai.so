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

# # Embed online resources
add_resources(["/home/josh/dev/acai.so/examples/python_server/embedchain/dnd-5e-srd/markdown/02 classes.md"])

# # Query the bot

resp = query_bot("What is the charisma modifier?")
print(resp)

