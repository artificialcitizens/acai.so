from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

from dotenv import load_dotenv

load_dotenv()

chat_anthropic = ChatAnthropic(temperature=0, model_name="claude-3-opus-20240229")

# system = (
#     "You are a helpful assistant that translates {input_language} to {output_language}. Output only the translated text, nothing else."
# )
# human = "{text}"
# prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

# chain = prompt | chat_anthropic
# result = chain.invoke(
#     {
#         "input_language": "English",
#         "output_language": "Korean",
#         "text": "나는 크고 뚱뚱한 램프를 사랑해",
#     }
# )

# print(result.content)

