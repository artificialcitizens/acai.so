import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManager } from 'langchain/callbacks';
import { HumanMessage, SystemMessage } from 'langchain/schema';
import { protoChain } from './proto-chain';
import { getToken } from '../../../../utils/config';

function extractCode(code: string): string | null {
  const match = code.match(/```(jsx|js|tsx)([\s\S]*?)```/);
  return match ? match[2].trim() : code;
}

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

  const extractedCode = extractCode(componentResponse.content);
  if (extractedCode !== null) {
    callbacks.handleProtoResponse(extractedCode);
  }

  const streamingModel = new ChatOpenAI({
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(callbacks),
    modelName: 'gpt-3.5-turbo',
  });

  const stream = await streamingModel.call([
    new SystemMessage(
      'Given the two versions of code, give a high level description of the changes you made. Keep it short and simple and in first person prose. If the code is completely new, say so, then give a high level description of the code.',
    ),
    new HumanMessage(
      `Old Code:\n${context}\n\nNew Code:\n${componentResponse.content}`,
    ),
  ]);

  return stream;
};
