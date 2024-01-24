from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.text_splitter import CharacterTextSplitter

from models.chat_model import model

suggested_speakers_prompt = ChatPromptTemplate.from_template("""Given the following transcript try to infer the names of the speakers, if you don't know just return the speaker_#
Example Output:
SPEAKER_01 > John Smith

#########
Transcript begins {transcript}""")

chain = suggested_speakers_prompt | model | StrOutputParser()

def infer_speakers(query:str) -> str:
  '''Given a transcript, infer the speakers
  Example Input:
  ```
SPEAKER_01 [00:00:42]:
Hello...

SPEAKER_00 [00:01:57]:
Hi...

SPEAKER_02 [00:02:56]:
Yo...
```
  '''
  text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=4000, chunk_overlap=0
 )
  split_text = text_splitter.split_text(query)

  return chain.invoke({"transcript": split_text[0]})

