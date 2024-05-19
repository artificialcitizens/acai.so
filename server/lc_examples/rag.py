from operator import itemgetter

from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from models.chat_model import model
from models.embedding_model import embeddings_model
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.create_documents(['harrison worked at kensho'])
vectorstore = FAISS.from_documents(docs, embeddings_model)

retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

def query(question):
    print(question)
    response = chain.invoke({"question": question})
    return response