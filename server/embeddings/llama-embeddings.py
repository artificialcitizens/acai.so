from langchain.tools import tool
from langchain_community.embeddings import LlamaCppEmbeddings

class LlamaCppEmbeddingTool():
    def __init__(self, model_path):
        self.llama = LlamaCppEmbeddings(model_path=model_path)

    @tool("Embed and query text")
    def embed_query(self, text):
        doc = self.llama.embed_query(text)
        return self.llama.embed_documents([doc])


# Create an instance of the EmbeddingTools class
embedding_tools = LlamaCppEmbeddingTool("/path/to/model/ggml-model-q4_0.bin")

# Use the tools as needed
text = "This is a test document."
query_result = embedding_tools.embed_query(text)