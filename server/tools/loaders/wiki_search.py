from langchain_community.document_loaders import WikipediaLoader

def wiki_search(query: str, load_max_docs: int = 2):
    """Search Wikipedia for the query and return the content of the first
    load_max_docs pages.
    """
    docs = WikipediaLoader(query=query, load_max_docs=load_max_docs).load()
    return [doc.page_content for doc in docs]

if __name__ == "__main__":
    search_results = wiki_search("king arthur")
    print(search_results[0])