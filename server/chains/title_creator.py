import os
from dotenv import load_dotenv

load_dotenv()

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from models.chat_model import model

create_title_prompt = ChatPromptTemplate.from_template("""Given the following context, come up with an appropriate title. Output the title and nothing else.
Content begins: 
{content}""")

chain = create_title_prompt | model | StrOutputParser()

def create_title(content:str) -> str:
  '''Given content, create an appropriate title'''
  try:
      return chain.invoke({"content": content})
  except Exception as e:
      # Appropriate error logging and handling
      return str(e)

