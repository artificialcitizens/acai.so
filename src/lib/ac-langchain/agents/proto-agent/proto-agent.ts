import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManager } from 'langchain/callbacks';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { protoChain } from './proto-chain';
import { getToken } from '../../../../utils/config';

export const protoAgentResponse = async ({
  query,
  chatHistory,
  context,
  callbacks,
}: {
  query: string;
  chatHistory: string;
  context: string;
  callbacks: {
    handleProtoResponse: (response: string) => void;
    handleLLMStart: () => void;
    handleLLMNewToken: (token: string) => void;
    handleLLMEnd: () => void;
    handleLLMError: (err: Error) => void;
  };
}) => {
  const { response } = await protoChain({
    query,
    chatHistory,
    context,
  });
  const componentResponse = await response;
  callbacks.handleProtoResponse(componentResponse.content);

  const streamingModel = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(callbacks),
    modelName: 'gpt-3.5-turbo',
  });

  const stream = await streamingModel.call([
    new SystemMessage(
      'Only return the response your component is being generated',
    ),
    new HumanMessage(
      'This is a test, only return, Your component is being generated',
    ),
  ]);

  return stream;
};
