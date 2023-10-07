import { HumanMessage, SystemMessage } from 'langchain/schema';
import { handleAcaiChat } from '../models/chat';

/**
 * Take notes based on the given transcription
 */
export const simplifyResponseChain = async (
  chatHistory: string,
): Promise<string> => {
  const prompt = `### Ignore all prior instructions
You are tasked with taking the chat history and assistant reply and creating a brief and contextually appropriate response that will be passed through a text to voice pipeline. 
This will just need to be a quick response because the user will receive the longer response in text form elsewhere
`;

  const { chat: model } = handleAcaiChat({ temperature: 0.5 });

  const response = await model.call([
    new SystemMessage(prompt),
    new HumanMessage(chatHistory),
  ]);

  return response.content;
};
