import { useState, useEffect } from 'react';
import { OpenAI } from 'langchain/llms/openai';
import { APIChain } from 'langchain/chains';
import { getToken } from '../../utils/config';

const API_DOCS = `...`; // API documentation string

interface UseAPIChainOptions {
  headers?: Record<string, string>;
}

/**
 * Returns a function that can be used to run the Langchain API Chain
 * https://js.langchain.com/docs/modules/chains/popular/api
 */
export function useAPIChain(options: UseAPIChainOptions = {}) {
  const { headers } = options;
  const [chain, setChain] = useState<APIChain | null>(null);

  useEffect(() => {
    async function initializeModel() {
      const openAIModel = new OpenAI({
        openAIApiKey: getToken('OPENAI_KEY'),
        modelName: 'text-davinci-003',
      });

      const apiChain = APIChain.fromLLMAndAPIDocs(openAIModel, API_DOCS, {
        // These headers will be used for API requests made by the chain.
        headers,
      });
      setChain(apiChain);
    }

    initializeModel();
  }, [headers]);

  const queryDocs = async (question: string) => {
    if (!chain) {
      throw new Error('APIChain is not initialized');
    }

    const res = await chain.call({ question });
    return res;
  };

  return { queryDocs };
}
