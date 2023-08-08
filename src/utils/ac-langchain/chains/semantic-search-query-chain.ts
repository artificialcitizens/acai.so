import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { CommaSeparatedListOutputParser } from 'langchain/output_parsers';
import { getToken } from '../../config';

/**
 *  Create a list of comma separated sentences to semantically search a vectorstore with.
 */
export const semanticSearchQueryGeneration = async (
  text: string,
): Promise<string[]> => {
  const prompt = new PromptTemplate({
    template: `Identify the key concepts in the following text: '{text}'.
    
    Now that you have identified the key concepts, generate a list of ONLY THREE comma separated 
    sentences to semantically search a vectorstore with. NO NUMBERS OR FORMATTING
    `,
    inputVariables: ['text'],
  });

  const model = new OpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    temperature: 0.5,
  });

  const input = await prompt.format({ text });
  const response = await model.call(input);

  const parser = new CommaSeparatedListOutputParser();
  return parser.parse(response);
};
