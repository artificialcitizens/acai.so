import { HumanMessage, SystemMessage } from 'langchain/schema';
import { useAcaiChat } from '../models/chat';

/**
 * Take notes based on the given transcription
 */
export const noteChain = async (
  transcript: string,
  priorList = 'no prior list',
): Promise<string> => {
  const prompt = `### Ignore all prior instructions
you are tasked with taking the transcript of one or more individuals talking 
and create a list of actionable items from the conversation.

Here is the previous list of actionable items, update or add as needed:
${priorList}
`;

  const { chat: model } = useAcaiChat({
    modelName: 'gpt-3.5-turbo-16k',
    temperature: 0,
  });

  const response = await model.call([
    new SystemMessage(prompt),
    new HumanMessage(transcript),
  ]);

  return response.text;
};
