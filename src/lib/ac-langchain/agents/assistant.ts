import { SystemMessage, HumanMessage } from 'langchain/schema';
import { loadChatModel } from '../models/chat';

/**
 * Query OpenAI Chat Model
 */
export const queryAssistant = async ({
  systemMessage,
  message,
  modelName,
  temperature = 0.5,
}: {
  systemMessage: string;
  message: string;
  modelName: string;
  temperature?: number;
}): Promise<string> => {
  const { chat } = loadChatModel({
    modelName,
    temperature: temperature,
  });
  const response = await chat.call([
    new SystemMessage(systemMessage),
    new HumanMessage(message),
  ]);
  return response.content;
};
