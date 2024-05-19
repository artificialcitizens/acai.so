
from operator import itemgetter
from langchain_community.embeddings import InfinityEmbeddings, InfinityEmbeddingsLocal
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from models.chat_model import model
documents = [
    "Baguette is a dish.",
    "Paris is the capital of France.",
    "numpy is a lib for linear algebra",
    "You escaped what I've escaped - You'd be in Paris getting fucked up too",
]
query = "Where is Paris?"
infinity_api_url = "http://localhost:7997"
# model is currently not validated.
embeddings = InfinityEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2", infinity_api_url=infinity_api_url
)
try:
    documents_embedded = embeddings.embed_documents(documents)
    query_result = embeddings.embed_query(query)
    print(query_result)
    print("embeddings created successful")
except Exception as ex:
    print(
        "Make sure the infinity instance is running."
    )


# embeddings = embeddings_model.embed_documents(
#     [
#         "Hi there!",
#         "Oh, hello!",
#         "What's your name?",
#         "My friends call me World",
#         "Hello World!"
#     ]
# )
# print(embeddings)
# vectorstore = FAISS.from_texts(
#         [
#         "Assisting User David with his academic research on the impact of climate change on marine life. Provided him with multiple resources including relevant scientific papers, news articles, and documentaries.",
#         "Guided User Emma through a detailed step-by-step troubleshooting process to fix a wireless connection issue on her home computer. She was able to complete her online assignment in time for its deadline",
#         "What's your name?",
#         "My friends call me World",
#         "Hello World!"
#     ], embedding=embeddings_model
# )
# retriever = vectorstore.as_retriever()

# template = """Answer the question based only on the following context:
# {context}

# Question: {question}
# """
# prompt = ChatPromptTemplate.from_template(template)

# chain = (
#     {"context": retriever, "question": RunnablePassthrough()}
#     | prompt
#     | model
#     | StrOutputParser()
# )

# print(chain.invoke("where did we help Emma do?"))