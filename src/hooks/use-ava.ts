import { useContext, useEffect, useState } from 'react';
import { avaChat } from '../utils/ac-langchain/agents/ava';
import { toastifyAgentThought, toastifyError } from '../components/Toast';
import { appStateMachine, handleCreateTab } from '../state';
import { useInterpret } from '@xstate/react';
import { marked } from 'marked';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/config';
// export const useAva = () => {
export const useAva = (): [
  fetchResponse: (message: string, systemMessage: string) => Promise<string>,
  loading: boolean,
] => {
  const [openAIApiKey] = getToken('OPENAI_KEY');
  const [googleApiKey] = getToken('GOOGLE_API_KEY');
  const [googleCSEId] = getToken('GOOGLE_CSE_ID');
  const [loading, setLoading] = useState(false);
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const navigate = useNavigate();

  const queryAva = async (
    message: string,
    systemMessage: string,
  ): Promise<string> => {
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
          handleCreateDocument: async ({
            title,
            content,
          }: {
            title: string;
            content: string;
          }) => {
            const tab = await handleCreateTab({ title, content }, workspaceId);
            console.log({ tab });
            globalServices.appStateService.send({
              type: 'ADD_TAB',
              tab,
            });
            setTimeout(() => {
              navigate(`/${workspaceId}/${tab.id}`);
            }, 250);
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

  return [queryAva, loading];
};
