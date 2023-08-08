import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { getToken } from '../../config';

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

  const model = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_API_KEY'),
    modelName: 'gpt-3.5-turbo-16k',
    temperature: 0,
  });

  const response = await model.call([
    new SystemChatMessage(prompt),
    new HumanChatMessage(transcript),
  ]);

  return response.text;
};
