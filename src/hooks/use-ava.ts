import { useContext, useState } from 'react';
import { avaChat } from '../utils/ac-langchain/agents/ava';
import { toastifyAgentThought, toastifyInfo } from '../components/Toast';
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
import { EditorContext } from '../context/EditorContext';

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
  const [state] = useActor(globalServices.agentStateService);
  const currentAgent = state.context[workspaceId];
  const formattedChatHistory = currentAgent.recentChatHistory
    .map(
      (chat: { type: 'ava' | 'user'; text: string }) =>
        `${chat.type}: ${chat.text}`,
    )
    .join('\n');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { editor } = useContext(EditorContext)!;

  const queryAva = async (
    message: string,
    systemMessage: string,
  ): Promise<string> => {
    if (editor) {
      console.log(editor.getText());
    }
    setLoading(true);
    toastifyInfo('Generating Text');
    switch (currentAgent.agentMode) {
      case 'chat': {
        const sysMessage = systemMessage
          ? await createCustomPrompt(systemMessage, formattedChatHistory)
          : // @TODO: Update once user profile is implemented
            await createAvaChatPrompt('Josh', formattedChatHistory);
        const response = await queryChat({
          systemMessage: sysMessage,
          message,
          modelName: currentAgent.openAIChatModel,
        });
        return response;
      }
      case 'assistant':
      case 'researcher':
      case 'custom': {
        const response = await avaChat({
          input: message,
          systemMessage,
          callbacks: {
            handleCreateDocument: async ({
              title,
              content,
            }: {
              title: string;
              content: string;
            }) => {
              const tab = await handleCreateTab(
                { title, content },
                workspaceId,
              );
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
      }
      default: {
        throw new Error(`Unexpected agentMode: ${currentAgent.agentMode}`);
      }
    }
  };

  return [queryAva, loading];
};
