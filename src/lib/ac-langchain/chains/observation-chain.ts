import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { getToken } from '../../../utils/config';

/**
 * Generate observations based on the given context
 * compared to the prior observations
 */
export const observationChain = async (
  context: string,
  priorObservations = 'no prior observations',
): Promise<string> => {
  const prompt = `### Ignore all prior instructions
you are tasked with taking the transcript of one or more individuals talking 
and create a list of observations from the context. Update any prior observations as needed
to match the updated information. Make connections in observations based on the information provided if there
seems to be anything the users are missing or needing to know.

Here is the previous list of observations
${priorObservations}
`;

  const model = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    modelName: 'gpt-4',
    temperature: 0,
  });
  console.log('context', context);
  const response = await model.call([
    new SystemChatMessage(prompt),
    new HumanChatMessage(context),
  ]);

  return response.text;
};
