import { useContext, useState } from 'react';
import { avaChat } from '../../lib/ac-langchain/agents/ava';
import { toastifyAgentLog } from '../Toast';
import { handleCreateTab } from '../../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { queryChat } from '../../lib/ac-langchain/agents/chat-model';
import {
  createAvaChatPrompt,
  createCustomPrompt,
  // createWritingPromptTemplate,
} from '../../lib/ac-langchain/agents/agent.prompts';
import { useActor } from '@xstate/react';
import { EditorContext } from '../../context/EditorContext';
// import { queryAssistant } from '../utils/ac-langchain/agents/assistant';
// import { queryRouterAgent } from '../utils/ac-langchain/agents/router-agent';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';
import axios from 'axios';
import { getToken } from '../../utils/config';

export type AvaChatResponse = {
  response: string;
  abort: () => void;
};

type MessageType = 'user' | 'ava';

type Message = {
  id: string;
  text: string;
  timestamp: string;
  type: MessageType;
};

export const agentMode = [
  'ava',
  'chat',
  'custom',
  // 'create',
  // 'research',
  // 'writer',
];

export const useAva = (): {
  queryAva: (
    message: string,
    systemMessage: string,
  ) => Promise<AvaChatResponse>;
  streamingMessage: string;
  error: string;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const navigate = useNavigate();
  const [state] = useActor(globalServices.agentStateService);
  const [userName] = useLocalStorageKeyValue('USER_NAME', '');
  const [userLocation] = useLocalStorageKeyValue('USER_LOCATION', '');
  const currentAgent = state.context[workspaceId];
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState('');
  const formattedChatHistory = currentAgent?.recentChatHistory
    .map(
      (chat: { type: 'ava' | 'user'; text: string }) =>
        `${chat.type}: ${chat.text}`,
    )
    .join('\n');

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { editor } = useContext(EditorContext)!;

  const queryAva = async (
    message: string,
    customPrompt: string,
  ): Promise<AvaChatResponse> => {
    setLoading(true);

    const mode = currentAgent.agentMode;
    switch (mode) {
      case 'chat': {
        // if the user has a custom prompt we override the system prompt
        const sysMessage = customPrompt
          ? await createCustomPrompt(customPrompt, formattedChatHistory)
          : await createAvaChatPrompt(
              userName || 'User',
              userLocation || 'Undisclosed',
              formattedChatHistory,
            );
        const response = await queryChat({
          systemMessage: sysMessage,
          message,
          modelName: currentAgent.openAIChatModel,
          callbacks: {
            handleLLMStart: (llm, prompts) => {
              setLoading(true);
              // console.log({ llm, prompts });
            },
            handleLLMNewToken: (token) => {
              setStreamingMessage((prev) => prev + token);
              // console.log(token);
            },
            handleLLMEnd: (output) => {
              setLoading(false);
              setStreamingMessage('');
              // console.log({ output });
            },
            handleLLMError: (err) => {
              setError(err.message);
              setLoading(false);
              // console.log({ err });
            },
          },
        });
        return {
          response: response.response,
          abort: response.abort,
        };
      }
      case 'ava': {
        const response = await avaChat({
          input: message,
          systemMessage: customPrompt,
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
        return {
          response: response,
          abort: () => {
            return;
          },
        };
      }
      case 'custom': {
        const agentPayload = {
          userMessage: message,
          userName: userName || 'User',
          userLocation: userLocation || 'Undisclosed',
          customPrompt,
          chatHistory: currentAgent?.recentChatHistory as Message[],
          currentDocument: editor?.getText() || '',
        };
        const agentUrl =
          getToken('CUSTOM_AGENT_URL') || import.meta.env.VITE_CUSTOM_AGENT_URL;

        if (!agentUrl) {
          return {
            response: 'Please set a custom agent URL in the settings menu',
            abort: () => {
              return;
            },
          };
        }

        setLoading(true);
        try {
          const res = await axios.post(`${agentUrl}/v1/agent`, agentPayload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const response = res.data.response;
          setLoading(false);

          return response;
        } catch (error: any) {
          setLoading(false);
          return error.message;
        }
      }

      default: {
        setLoading(false);
        throw new Error(`Unexpected agentMode: ${currentAgent.agentMode}`);
      }
    }
  };

  return { queryAva, loading, streamingMessage, error };
};
