import { PromptTemplate } from 'langchain/prompts';
import { useAcaiLLM } from '../models/chat';

const { llm: model } = useAcaiLLM();
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
