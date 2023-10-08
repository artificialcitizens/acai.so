import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getToken } from '../../../utils/config';
import { OpenAI } from 'langchain/llms/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const auth = {
  openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
  configuration: {
    baseURL:
      getToken('OPENAI_API_BASE') ?? import.meta.env.VITE_OPENAI_API_BASE,
  },
};

const acaiDefaults = {
  ...auth,
  streaming: true,
  temperature: 0,
  maxTokens: 1024,
};

// Need a central way to assign acai-managed config
// Only supports OpenAI for now
export function handleAcaiChat(fields: any = {}) {
  return {
    chat: new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      ...acaiDefaults,
      ...fields,
    }),
  };
}

// I think we should consolidate to Chat in all cases, but this replaces non-chat for now
export function handleAcaiLLM(fields: any = {}) {
  return {
    llm: new OpenAI({
      ...acaiDefaults,
      ...fields,
    }),
  };
}

export function handleAcaiEmbeddings(fields: any = {}) {
  return {
    embeddings: new OpenAIEmbeddings(
      {
        openAIApiKey: auth.openAIApiKey,
      },
      {
        baseURL: auth.configuration.baseURL,
      },
    ),
  };
}
