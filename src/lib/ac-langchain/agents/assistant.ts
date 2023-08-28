import { ChatOpenAI } from 'langchain/chat_models/openai';
import { SystemMessage, HumanMessage } from 'langchain/schema';
import { getToken } from '../../../utils/config';

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
  const chat = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    modelName,
    temperature: temperature,
  });
  const response = await chat.call([
    new SystemMessage(systemMessage),
    new HumanMessage(message),
  ]);
  return response.content;
};
