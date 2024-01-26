// @TODO: figure out why these imports are not working with the linter
import {
  SystemMessage,
  HumanMessage,
  // eslint-disable-next-line import/named
  LLMResult,
  BaseMessage,
} from 'langchain/schema';
import { loadChatModel } from '../models/chat';
import { toastifyError } from '../../../components/Toast';

type ChatResponse = {
  response: string;
};

/**
 * Query OpenAI Chat Model
 */
export const queryChat = async ({
  systemMessage,
  message,
  messages,
  modelName,
  temperature = 0.5,
  callbacks: {
    handleLLMStart,
    handleLLMEnd,
    handleLLMNewToken,
    handleLLMError,
  },
}: {
  systemMessage: string;
  message: string;
  modelName: string;
  temperature?: number;
  messages: BaseMessage[];
  callbacks: {
    handleLLMStart: (llm: any, prompts: string[]) => void;
    handleLLMEnd: (output: LLMResult) => void;
    handleLLMNewToken: (token: string) => void;
    handleLLMError: (err: Error) => void;
  };
}): Promise<ChatResponse> => {
  const controller = new AbortController();
  const { chat } = loadChatModel({
    modelName,
    temperature,
    // callbacks, // @TODO: idk why it doesn't let me put callbacks here, but it wasn't there before anyway...
  });

  const response = await chat.call(
    [new SystemMessage(systemMessage), ...messages, new HumanMessage(message)],
    {
      signal: controller.signal,
      callbacks: [
        {
          handleLLMStart: async (llm: any, prompts: string[]) => {
            handleLLMStart(llm, prompts);
            // console.log(JSON.stringify(llm, null, 2));
            // console.log(JSON.stringify(prompts, null, 2));
          },
          handleLLMEnd: async (output: LLMResult) => {
            handleLLMEnd(output);
            // console.log(JSON.stringify(output, null, 2));
          },
          handleLLMNewToken(token: string) {
            handleLLMNewToken(token);
            // console.log({ token });
          },
          handleLLMError: async (err: Error) => {
            handleLLMError(err);
            // console.error(err);
            toastifyError(err.message);
          },
        },
      ],
    },
  );
  return {
    response: response.content,
  };
};
