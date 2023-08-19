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
  createWritingPromptTemplate,
} from '../utils/ac-langchain/agents/agent.prompts';
import { useActor } from '@xstate/react';
import { EditorContext } from '../context/EditorContext';
import { queryAssistant } from '../utils/ac-langchain/agents/assistant';

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
    setLoading(true);
    toastifyInfo('Generating Text');
    switch (currentAgent.agentMode) {
      case 'ava': {
        try {
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
                const tab = await handleCreateTab(
                  { title, content },
                  workspaceId,
                );
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
          toastifyInfo('Error generating text');
          return '';
        } finally {
          setLoading(false);
        }
      }
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
      case 'writing-assistant': {
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
        return response;
      }
      default: {
        throw new Error(`Unexpected agentMode: ${currentAgent.agentMode}`);
      }
    }
  };

  return [queryAva, loading];
};
