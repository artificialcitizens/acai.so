from langchain_community.document_loaders import AsyncHtmlLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

def get_weather(zip_code: str) -> str:
    """Load the trending page from GitHub, input is the zip code"""
    urls = [f"https://weather.com/weather/tenday/l/{zip_code}"]
    loader = AsyncHtmlLoader(urls)
    docs = loader.load()

    bs_transformer = BeautifulSoupTransformer()
    docs_transformed = bs_transformer.transform_documents(
        docs, tags_to_extract=["summary", "h2", "p"]
    )
    page = docs_transformed[0].page_content
    return page

if __name__ == "__main__":
    page = get_weather("97230")
    print(page)