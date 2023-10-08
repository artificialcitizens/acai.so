import { HumanMessage, SystemMessage } from 'langchain/schema';
import { handleAcaiChat } from '../models/chat';

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

  const { chat: model } = handleAcaiChat({
    modelName: 'gpt-4',
    temperature: 0,
  });
  console.log('context', context);
  const response = await model.call([
    new SystemMessage(prompt),
    new HumanMessage(context),
  ]);

  return response.text;
};
