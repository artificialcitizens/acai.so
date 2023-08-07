// import { CallbackManager } from 'langchain/callbacks';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';

const systemPrompt = `You are an AI writing assistant that continues existing text based on given from prior text.
Give more weight/priority to the later characters than the beginning ones
`;

export const autoComplete = async ({
  context,
  relatedInfo,
  openAIApiKey,
  callbacks,
}: {
  context: string;
  relatedInfo: string;
  openAIApiKey: string;
  callbacks: {
    onMessageStart?: (message: string) => void;
    onMessageError?: (error: string) => void;
    onMessageStream?: (message: string) => void;
    onMessageComplete?: (completion: string) => void;
  };
}): Promise<string> => {
  const model = new ChatOpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo-16k',
    temperature: 0.35,
    streaming: true,
    callbacks: [
      {
        handleLLMStart: async (llm, prompts) => {
          callbacks.onMessageStart && callbacks.onMessageStart('starting');
        },
        handleLLMNewToken(token, runId, parentRunId) {
          callbacks.onMessageStream && callbacks.onMessageStream(token);
        },
        handleLLMEnd: async (output) => {
          const { text } = output.generations[0][0];
          callbacks.onMessageComplete && callbacks.onMessageComplete(text);
        },
        handleLLMError: async (err: Error) => {
          callbacks.onMessageError && callbacks.onMessageError(err.message);
        },
      },
    ],
  });

  const formattedInfo = `
  Related information that can be used to help inform the brief autocomplete of the sentence and no more than 50 characters.
  
  ${relatedInfo}

  Related information that can be used to help inform the brief autocomplete of the sentence and NO MORE THAN 50 CHARACTERS
  `;

  console.log({
    formattedInfo,
    context,
    systemPrompt,
  });

  const response = await model.call([
    new SystemChatMessage(`${systemPrompt} \n\n ${formattedInfo}`),
    new HumanChatMessage(context),
  ]);
  return response.text;
};
