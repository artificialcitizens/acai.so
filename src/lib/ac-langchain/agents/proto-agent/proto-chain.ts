import { ChatOpenAI } from 'langchain/chat_models/openai';
import { protoAgentResponsePrompt } from './proto-prompts';
import { getToken } from '../../../../utils/config';
import { SystemMessage, HumanMessage } from 'langchain/schema';

const openAIApiKey = getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY;

const model = new ChatOpenAI({
  openAIApiKey,
  modelName: 'gpt-4',
});

export const protoChain = async ({
  query,
  chatHistory,
  context,
}: {
  query: string;
  chatHistory: string;
  context: string;
}) => {
  if (!query) {
    throw new Error('No question found');
  }
  const systemMessage = await protoAgentResponsePrompt({
    context,
    conversation_history: chatHistory,
  });

  const response = model.call([
    new SystemMessage(systemMessage),
    new HumanMessage(query + '\n Output:'),
  ]);

  return {
    response,
  };
};
