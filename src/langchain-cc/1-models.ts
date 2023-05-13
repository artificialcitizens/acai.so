import { OpenAI } from 'langchain/llms/openai';

export const LLMExample = async (query: string) => {
  const model = new OpenAI();
  // `call` is a simple string-in, string-out method for interacting with the model.
  const res = await model.call(query);

  return res;
};
