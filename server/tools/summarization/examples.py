# https://python.langchain.com/docs/use_cases/summarization
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI
from time import time
from dotenv import load_dotenv

load_dotenv()

####################
# STUFF CHAIN #
####################

from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
docs = loader.load()

# Define prompt
prompt_template = """Write a concise summary of the following:
"{text}"
CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(prompt_template)

# Define LLM chain
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-16k")
llm_chain = LLMChain(llm=llm, prompt=prompt)

# Define StuffDocumentsChain
stuff_chain = StuffDocumentsChain(llm_chain=llm_chain, document_variable_name="text")

docs = loader.load()
stuff_chain_time_start = time()
print(stuff_chain.run(docs))
# The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and examples of proof-of-concept demos, highlighting the challenges and limitations of LLM-powered agents. It also includes citations and references for further reading.
print(f"Stuff chain took {time() - stuff_chain_time_start} seconds") 
# Stuff chain took 8.96 seconds

####################
# MAP/REDUCE CHAIN #
####################

from langchain.chains import MapReduceDocumentsChain, ReduceDocumentsChain
from langchain.text_splitter import CharacterTextSplitter

llm = ChatOpenAI(temperature=0)

# Map
map_template = """The following is a set of documents
{docs}
Based on this list of docs, please identify the main themes 
Helpful Answer:"""
map_prompt = PromptTemplate.from_template(map_template)
map_chain = LLMChain(llm=llm, prompt=map_prompt)

# Reduce
reduce_template = """The following is set of summaries:
{docs}
Take these and distill it into a final, consolidated summary of the main themes. 
Helpful Answer:"""
reduce_prompt = PromptTemplate.from_template(reduce_template)

# Run chain
reduce_chain = LLMChain(llm=llm, prompt=reduce_prompt)

# Takes a list of documents, combines them into a single string, and passes this to an LLMChain
combine_documents_chain = StuffDocumentsChain(
    llm_chain=reduce_chain, document_variable_name="docs"
)

# Combines and iteratively reduces the mapped documents
reduce_documents_chain = ReduceDocumentsChain(
    # This is final chain that is called.
    combine_documents_chain=combine_documents_chain,
    # If documents exceed context for `StuffDocumentsChain`
    collapse_documents_chain=combine_documents_chain,
    # The maximum number of tokens to group documents into.
    token_max=4000,
)

# Combining documents by mapping a chain over them, then combining results
map_reduce_chain = MapReduceDocumentsChain(
    # Map chain
    llm_chain=map_chain,
    # Reduce chain
    reduce_documents_chain=reduce_documents_chain,
    # The variable name in the llm_chain to put the documents in
    document_variable_name="docs",
    # Return the results of the map steps in the output
    return_intermediate_steps=False,
)

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1000, chunk_overlap=0
)
split_docs = text_splitter.split_documents(docs)

map_reduce_chain_time_start = time()
print(map_reduce_chain.run(split_docs))
# The main themes identified in the provided documents are:

# 1. LLM-powered autonomous agents: The concept of building agents with LLM as their core controller is discussed, highlighting the potential of LLM as a powerful general problem solver.

# 2. Agent system overview: The components of a LLM-powered autonomous agent system are explained, including planning, memory, and tool use. Each component is described in detail, emphasizing their roles in enabling efficient handling of complex tasks.

# 3. Planning: The agent's ability to break down large tasks into smaller subgoals and engage in self-reflection and refinement to improve future actions.

# 4. Memory: The utilization of short-term and long-term memory in the agent's learning and information retention/recall processes.

# 5. Tool use: The agent's capability to access external APIs for additional information and resources that may be missing from the model weights.

# 6. Case studies and proof-of-concept examples: The application of LLM-powered autonomous agents in scientific discovery and generative agents simulation, showcasing the versatility and potential of this approach.

# 7. Challenges: Potential challenges and limitations associated with building and utilizing LLM-powered autonomous agents.

# 8. Citation and references: Proper citation and references to acknowledge the sources and inspirations for the concepts discussed.

# These main themes encompass the discussions on LLM-powered autonomous agents, their components and capabilities, planning and memory mechanisms, tool use, case studies, challenges, and the importance of proper citation and references.

print(f"MapReduce chain took {time() - map_reduce_chain_time_start} seconds")
# MapReduce chain took 101.42 seconds

####################
# REFINEMENT CHAIN #
####################
from langchain.chains.summarize import load_summarize_chain

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
chain = load_summarize_chain(
    llm=llm,
    chain_type="refine",
    question_prompt=prompt,
    refine_prompt=refine_prompt,
    return_intermediate_steps=False,
    input_key="input_documents",
    output_key="output_text",
)
refine_chain_time_start = time()
result = chain({"input_documents": split_docs}, return_only_outputs=True)
print(f"Refine chain took {time() - refine_chain_time_start} seconds")
# MapReduce chain took 101.41815257072449 seconds
print(result["output_text"])
# The article discusses the concept of building autonomous agents powered by large language models (LLM) and explores their components, potential, and challenges. It introduces planning and self-reflection as additional components and presents frameworks and techniques to enhance agent performance. The concept of memory, tool use, and case studies in scientific discovery are also discussed. The article concludes by highlighting the limitations of using LLMs and providing guidelines for performance evaluation. The challenges of limited context capacity, long-term planning, and the reliability of natural language interfaces are also addressed. The article also references several related papers and resources that provide further insights into the topic.