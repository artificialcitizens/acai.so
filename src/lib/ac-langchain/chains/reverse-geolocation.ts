import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { getToken } from '../../../utils/config';

const model = new OpenAI({
  openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
  temperature: 0,
});
/**
 * Create a step by step task list based on given subject.
 */
export const reverseGeolocation = async (coords: string): Promise<string> => {
  const prompt = new PromptTemplate({
    template: 'Return the named location of these coords:\n{coords}.',
    inputVariables: ['coords'],
  });

  const input = await prompt.format({ coords });
  const response = await model.call(input);

  return response;
};
