import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getToken } from '../../../utils/config';
import { OpenAI } from 'langchain/llms/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const setDefaults = () => {
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
  return {
    ...acaiDefaults,
  };
};

// Need a central way to assign acai-managed config
// Only supports OpenAI for now
export function loadChatModel(fields: any = {}) {
  return {
    chat: new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      ...setDefaults(),
      ...fields,
    }),
  };
}

// I think we should consolidate to Chat in all cases, but this replaces non-chat for now
export function handleAcaiLLM(fields: any = {}) {
  return {
    llm: new OpenAI({
      ...setDefaults(),
      ...fields,
    }),
  };
}

export function loadEmbeddingModel(fields: any = {}) {
  const auth = {
    openAIApiKey: getToken('OPENAI_KEY') || import.meta.env.VITE_OPENAI_KEY,
    configuration: {
      baseURL:
        getToken('OPENAI_EMBEDDING_API_BASE_URL') ??
        import.meta.env.VITE_OPENAI_EMBEDDING_BASE_URL,
    },
  };
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
