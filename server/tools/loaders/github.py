from langchain_community.document_loaders import AsyncHtmlLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

def load_github_trending():
    """Load the trending page from GitHub"""
    urls = ["https://github.com/trending"]
    loader = AsyncHtmlLoader(urls)
    docs = loader.load()

    bs_transformer = BeautifulSoupTransformer()
    docs_transformed = bs_transformer.transform_documents(
        docs, tags_to_extract=["h2", "p"]
    )
    page = docs_transformed[0].page_content
    return page

if __name__ == "__main__":
    page = load_github_trending()
    print(page)