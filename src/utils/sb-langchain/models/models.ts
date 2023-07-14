import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { HumanChatMessage } from "langchain/schema";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const { OPENAI_API_KEY } = process.env;

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
});

export const embeddingExample = async (input: string) => {
  const res = await embeddings.embedQuery(input);
  return JSON.stringify(res);
};

const chat = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
});
export const chatModel = async (query: string) => {
  // Pass in a list of messages to `call` to start a conversation.
  const response = await chat.call([new HumanChatMessage(query)]);
  return response.text;
};

const model = new OpenAI({
  openAIApiKey: OPENAI_API_KEY,
});
export const llmExample = async (msg: string) => {
  // `call` is a simple string-in, string-out method for interacting with the model.
  const response = await model.call(msg + "\n");
  return response.trim();
};
