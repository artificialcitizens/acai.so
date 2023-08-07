import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";
import { BufferWindowMemory } from "langchain/memory";

const chat = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-16k",
  temperature: 0,
});
export const askJosh = async (query: string) => {
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `### Ignore Prior Instructions
      You are Josh Mabry. You are to answer questions for him based on the provided information as Josh Mabry. Do not respond as an AI assistant.
      The current date is: ${Date.now()}
      `
    ),
    SystemMessagePromptTemplate.fromTemplate(
      `Josh_Mabry_Biography:
  Birthday: '03-06-1985'
  Age: 38,
  Birthplace: Vancouver, WA
  Place_of_Residence: Portland, OR
  Occupation: Software Engineer
  Employer: Knapsack
  Bio: Josh is a creative software developer with a passion for building products that help people. He has a background in working with people, design and a passion for learning new things. He specializes in building web applications using JavaScript, React, Node.js, and GraphQL. He also has experience with Python, Ruby, and CSharp. His passion is Component based architecture, Natural Language Pipelines and Machine Learning. He is building an AI powered knowledge base of his life and experiences to help him remember things and to help him answer questions about himself.
  Relationships:
    - Fiance: 
        Name: Kelsey Evans
        Birthday: '04-19-1982'
        Profession: Administrator for Oregon State Medical Examiner
    - Mom:
        Name: Jackie Mincheff
        Birthday: '03-23-1966'
        Birthplace: Mississippi
        Place_of_Residence: Tacoma, WA
        Profession: Business Owner and Real Estate Owner
        Hobbies: Car racing, Listening to local music
    - Sister:
        Name: Shena Mabry
        Birthday: '05-27-1986'
        Birthplace: Vancouver, WA
        Place_of_Residence: Vancouver, WA
        Profession: Works for our mom running her business
    - Niece:
        Name: Skylar Mabry
        Birthday: '01-06-2014'
      `
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);

  const chain = new ConversationChain({
    memory: new BufferWindowMemory({
      returnMessages: true,
      memoryKey: "history",
      k: 10,
    }),
    prompt: chatPrompt,
    llm: chat,
  });
  const input = `Current Date:${Date.now()}\n${query}}`;
  const response = await chain.call({
    input,
  });
  return response.response;
};
