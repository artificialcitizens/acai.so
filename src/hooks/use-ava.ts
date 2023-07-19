import { useEffect, useState } from 'react';
import useCookieStorage from './use-cookie-storage';
import { avaChat } from '../utils/sb-langchain/agents/ava';
import { toastifyAgentThought, toastifyError } from '../components/Toast';
import { appStateMachine, handleCreateTab } from '../state';
import { useInterpret } from '@xstate/react';
import { marked } from 'marked';
// export const useAva = () => {
export const useAva = (): [
  fetchResponse: (message: string, systemMessage: string) => Promise<string>,
  loading: boolean,
] => {
  const [openAIApiKey] = useCookieStorage('OPENAI_KEY');
  const [googleApiKey] = useCookieStorage('GOOGLE_API_KEY');
  const [googleCSEId] = useCookieStorage('GOOGLE_CSE_ID');
  const [loading, setLoading] = useState(false);
  const service = useInterpret(appStateMachine);

  const fetchResponse = async (message: string, systemMessage: string): Promise<string> => {
    setLoading(true);
    if (!openAIApiKey || !googleApiKey || !googleCSEId) {
      toastifyError('Missing API keys');
      return 'Missing API keys';
    }
    try {
      const response = await avaChat({
        input: message,
        systemMessage,
        tokens: {
          openAIApiKey,
          googleApiKey,
          googleCSEId,
        },
        callbacks: {
          handleCreateDocument: (data) => {
            console.log('handleCreateDoc callback', { data });
            const title = data.split('Title: ')[1].split(', Content:')[0].replace(/"/g, '');
            const content = data.split(', Content: ')[1].replace(/"/g, '');
            handleCreateTab({ title, content }, service.getSnapshot().context.activeWorkspaceId, service.send);
          },
          handleAgentAction: (action) => {
            const thought = action.log.split('Action:')[0].trim();
            toastifyAgentThought(thought);
          },
        },
      });
      return response;
    } catch (error) {
      console.log({ error });
      toastifyError('Error fetching response');
      return 'I am not sure how to respond to that.';
    } finally {
      setLoading(false);
    }
  };

  return [fetchResponse, loading];
};
