from time import time

from chains.title_creator import create_title
from models.chat_model import model

from langchain.chains.summarize import load_summarize_chain
from langchain.text_splitter import CharacterTextSplitter
from langchain.prompts import PromptTemplate

llm = model
prompt_template = """Write a concise summary of the following:
{text}
CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(prompt_template)

refine_template = (
    "Your job is to produce a final summary\n"
    "We have provided an existing summary up to a certain point: {existing_answer}\n"
    "We have the opportunity to refine the existing summary"
    "(only if needed) with some more context below.\n"
    "------------\n"
    "{text}\n"
    "------------\n"
    "Given the new context, refine the original summary as best as you can.\n"
    "If the context isn't useful, return the original summary."
)
refine_prompt = PromptTemplate.from_template(refine_template)

from langchain.docstore.document import Document
from langchain.chains.summarize import load_summarize_chain

def create_title_and_summary(text):
    stuff_summary_chain = load_summarize_chain(
        llm=llm,
        chain_type="refine",
        question_prompt=prompt,
        refine_prompt=refine_prompt,
        return_intermediate_steps=False,
        input_key="input_documents",
        output_key="output_text",
    )
    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=1000, chunk_overlap=0
    )
    docs = Document(page_content=text)
    split_docs = text_splitter.split_documents([docs])


    result = stuff_summary_chain({"input_documents": split_docs}, return_only_outputs=True)

    summary = result["output_text"]


    stuff_summary_chain = load_summarize_chain(llm, chain_type="stuff")
    docs = Document(page_content=summary)
    lite_summary = stuff_summary_chain.run([docs])
    title = create_title(lite_summary)
    return title, lite_summary, summary
