import { useContext, useState } from 'react';
import { avaChat } from '../utils/ac-langchain/agents/ava';
import {
  toastifyAgentThought,
  toastifyError,
  toastifyInfo,
} from '../components/Toast';
import { handleCreateTab } from '../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { queryChat } from '../utils/ac-langchain/agents/chat-model';
import {
  createAvaChatPrompt,
  createCustomPrompt,
} from '../utils/ac-langchain/agents/agent.prompts';
import { useActor } from '@xstate/react';

export const useAva = (): [
  fetchResponse: (message: string, systemMessage: string) => Promise<string>,
  loading: boolean,
] => {
  const [loading, setLoading] = useState(false);
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const navigate = useNavigate();
  const agentState = globalServices.agentStateService;
  const [state, send] = useActor(globalServices.agentStateService);
  const currentAgent = state.context[workspaceId];
  const formattedChatHistory = currentAgent.recentChatHistory
    .map(
      (chat: { type: 'ava' | 'user'; text: any }) =>
        `${chat.type}: ${chat.text}`,
    )
    .join('\n');
  const queryAva = async (
    message: string,
    systemMessage: string,
  ): Promise<string> => {
    setLoading(true);
    toastifyInfo('Generating Text');
    console.log(formattedChatHistory);
    switch (currentAgent.agentMode) {
      case 'chat': {
        const sysMessage = systemMessage
          ? await createCustomPrompt(systemMessage, formattedChatHistory)
          : await createAvaChatPrompt('Josh', formattedChatHistory);
        console.log({ sysMessage });
        const response = await queryChat({
          systemMessage: sysMessage,
          message,
          modelName: currentAgent.openAIChatModel,
        });
        console.log({ response });
        return response;
      }
      case 'researcher':
        break;
      case 'assistant':
        break;
      case 'custom':
        break;
      default: {
        const response = await queryChat({
          systemMessage,
          message,
          modelName: currentAgent.openAIChatModel,
        });
        return response;
      }
    }
    // try {
    //   const response = await avaChat({
    //     input: message,
    //     systemMessage,
    //     callbacks: {
    //       handleCreateDocument: async ({
    //         title,
    //         content,
    //       }: {
    //         title: string;
    //         content: string;
    //       }) => {
    //         const tab = await handleCreateTab({ title, content }, workspaceId);
    //         console.log({ tab });
    //         globalServices.appStateService.send({
    //           type: 'ADD_TAB',
    //           tab,
    //         });
    //         setTimeout(() => {
    //           navigate(`/${workspaceId}/${tab.id}`);
    //         }, 250);
    //       },
    //       handleAgentAction: (action) => {
    //         const thought = action.log.split('Action:')[0].trim();
    //         toastifyAgentThought(thought);
    //       },
    //     },
    //   });
    //   return response;
    // } catch (error) {
    //   console.log({ error });
    //   toastifyError('Error fetching response');
    //   return 'I am not sure how to respond to that.';
    // } finally {
    //   setLoading(false);
    // }
  };

  return [queryAva, loading];
};
