import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManager } from 'langchain/callbacks';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { ragChain } from './rag-chain';
import { getToken } from '../../../../utils/config';

export const ragAgentResponse = async ({
  query,
  chatHistory,
  context,
  callbacks,
}: {
  query: string;
  chatHistory: string;
  context: string;
  callbacks: {
    handleLLMStart: () => void;
    handleLLMNewToken: (token: string) => void;
    handleLLMEnd: () => void;
    handleLLMError: (err: Error) => void;
  };
}) => {
  const { responsePrompt, question } = await ragChain({
    query,
    chatHistory,
    context,
  });
  const streamingModel = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(callbacks),
    modelName: 'gpt-3.5-turbo-16k',
  });

  const stream = await streamingModel.call([
    new SystemMessage(responsePrompt),
    new HumanMessage(question),
  ]);

  return stream;
};
