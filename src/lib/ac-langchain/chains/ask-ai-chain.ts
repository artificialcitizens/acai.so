// @TODO: figure out why these imports are not working with the linter
// eslint-disable-next-line import/named
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  LLMResult,
  BaseMessage,
} from 'langchain/schema';
import { handleAcaiChat } from '../models/chat';

type ChatResponse = {
  response: string;
};

const systemMessageTemplate = (
  context: string,
) => `### You are assisting a user with a document they are writing.
Use the context of the document as context, but focus on the highlighted section of the document to achieve the user's goal.
KEY RULES: 
- Only output the text rewritten text, do not add any additional explanation or context`;
// const message = 'How are you?';
const instruction = (
  task: string,
  highlighted: string,
) => `Perform the following task: ${task}
On the following highlighted text: 
${highlighted}
`;
// const messages = [new HumanMessage(message)];

/**
 * Query Ask AI
 */
export const askAi = async ({
  // @TODO: Need to chunk the document for long documents and better focus on the highlighted section
  documentContext,
  task,
  highlighted,
  // @TODO: Add support for tracking chat/revision history for contextual rewriting
  messages,
  modelName = 'gpt-3.5-turbo-16k',
  temperature = 0.5,
  callbacks: {
    handleLLMStart,
    handleLLMEnd,
    handleLLMNewToken,
    handleLLMError,
  },
}: {
  documentContext: string;
  task: string;
  highlighted: string;
  modelName?: string;
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
  const { chat } = handleAcaiChat({
    modelName,
    temperature,
  });
  // we should trim the document context to the x chars before and after the highlighted section
  // const systemMessage = systemMessageTemplate(documentContext);
  const systemMessage = systemMessageTemplate('');
  const formattedInstruction = instruction(task, highlighted);
  const response = await chat.call(
    [
      new SystemMessage(systemMessage),
      ...messages,
      new HumanMessage(formattedInstruction),
    ],
    {
      signal: controller.signal,
      callbacks: [
        {
          handleLLMStart: async (llm: any, prompts: string[]) => {
            handleLLMStart(llm, prompts);
            console.log(JSON.stringify(llm, null, 2));
            console.log(JSON.stringify(prompts, null, 2));
          },
          handleLLMEnd: async (output: LLMResult) => {
            handleLLMEnd(output);
            console.log(JSON.stringify(output, null, 2));
          },
          handleLLMNewToken(token: string) {
            handleLLMNewToken(token);
            console.log({ token });
          },
          handleLLMError: async (err: Error) => {
            handleLLMError(err);
            console.error(err);
          },
        },
      ],
    },
  );
  return {
    response: response.content,
  };
};
