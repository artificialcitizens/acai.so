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
