import { useContext, useState } from 'react';
import { avaChat } from '../utils/ac-langchain/agents/ava';
import { toastifyAgentLog } from '../components/Toast';
import { handleCreateTab, agentModeUtterances } from '../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { queryChat } from '../utils/ac-langchain/agents/chat-model';
import {
  createAvaChatPrompt,
  createCustomPrompt,
  createWritingPromptTemplate,
} from '../utils/ac-langchain/agents/agent.prompts';
import { useActor } from '@xstate/react';
import { EditorContext } from '../context/EditorContext';
import { queryAssistant } from '../utils/ac-langchain/agents/assistant';
import { queryRouterAgent } from '../utils/ac-langchain/agents/router-agent';

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
  const formattedChatHistory = currentAgent?.recentChatHistory
    .map(
      (chat: { type: 'ava' | 'user'; text: string }) =>
        `${chat.type}: ${chat.text}`,
    )
    .join('\n');
  const formattedActions = Object.entries(agentModeUtterances).map(
    ([key, value]) => {
      if (key === 'ava') return;

      return `${key}: \n-${value.join(',\n ')}`;
    },
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { editor } = useContext(EditorContext)!;
  const queryAva = async (
    message: string,
    systemMessage: string,
  ): Promise<string> => {
    setLoading(true);
    let mode = currentAgent.agentMode;
    if (currentAgent.agentMode === 'ava') {
      const response = await queryRouterAgent({
        actions: formattedActions.join('\n'),
        input: message,
        chatHistory: formattedChatHistory,
      });
      mode = response;
    }
    switch (mode) {
      case 'chat': {
        // if the user has a custom prompt we override the system prompt
        const sysMessage = systemMessage
          ? await createCustomPrompt(systemMessage, formattedChatHistory)
          : // @TODO: Update once user profile is implemented
            await createAvaChatPrompt('Josh', formattedChatHistory);
        const response = await queryChat({
          systemMessage: sysMessage,
          message,
          modelName: currentAgent.openAIChatModel,
        });
        setLoading(false);
        return response;
      }
      case 'help': {
        if (!editor) throw new Error('No editor');
        const prompt = await createWritingPromptTemplate({
          user: 'Josh',
          document: editor.getText(),
          chatHistory: formattedChatHistory,
        });
        const response = await queryAssistant({
          systemMessage: prompt,
          message,
          modelName: currentAgent.openAIChatModel,
        });
        setLoading(false);
        return response;
      }
      case 'create': {
        const response = await avaChat({
          input: message,
          systemMessage,
          chatHistory: formattedChatHistory,
          currentDocument: editor?.getText() || '',
          callbacks: {
            handleCreateDocument: async ({
              title,
              content,
            }: {
              title: string;
              content: string;
            }) => {
              console.log('create document', {
                title,
                content,
              });
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
              toastifyAgentLog(thought);
            },
          },
        });
        setLoading(false);
        return response;
      }
      default: {
        setLoading(false);
        throw new Error(`Unexpected agentMode: ${currentAgent.agentMode}`);
      }
    }
  };

  return [queryAva, loading];
};
