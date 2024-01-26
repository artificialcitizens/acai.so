from langchain_community.document_loaders import AsyncHtmlLoader

urls = ["https://weather.com/weather/tenday/l/97230"]
loader = AsyncHtmlLoader(urls)
docs = loader.load()

from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)

page = docs_transformed[0].page_content

print(page)
