import { useContext, useState } from 'react';
import { avaChat } from '../../lib/ac-langchain/agents/ava';
import { toastifyAgentLog } from '../Toast';
import { ACDoc, handleCreateDoc } from '../../state';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useNavigate, useParams } from 'react-router-dom';
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
// import SocketContext from '../../context/SocketContext';
import { ragAgentResponse } from '../../lib/ac-langchain/agents/rag-agent/rag-agent';
import { VectorStoreContext } from '../../context/VectorStoreContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { askAi } from '../../lib/ac-langchain/chains/ask-ai-chain';
import { Task, useCrewAi } from '../CrewAI/use-crew-ai';
import { protoAgentResponse } from '../../lib/ac-langchain/agents/proto-agent/proto-agent';

export type AvaChatResponse = {
  response: string;
  // abortController: AbortController | null;
};

export type MessageRole = 'user' | 'assistant';

type Message = {
  id: string;
  text: string;
  timestamp: string;
  type: MessageRole;
};

export const agentMode = [
  'chat',
  'crew',
  'proto',
  // maps to rag agent
  'knowledge',
  'custom',
];

if (import.meta.env.DEV) {
  agentMode.unshift('ava');
}

export const useAva = (): {
  queryAva: ({
    message,
    systemMessage,
    override,
    args,
  }: {
    message: string;
    systemMessage: string;
    /**
     * Override the agent mode
     */
    override?: string;
    args?: { [key: string]: string };
  }) => Promise<AvaChatResponse>;
  streamingMessage: string;
  error: string;
  loading: boolean;
  // abortController: AbortController | null;
} => {
  const [loading, setLoading] = useState(false);
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const vectorContext = useContext(VectorStoreContext);
  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const workspaceId = rawWorkspaceId || 'docs';
  const { models, tools, crews } = useCrewAi();
  const [protoState] = useActor(globalServices.protoStateService);
  // @TODO - Seems to need to be here to get the context to load, why though?
  const knowledgeItems = useLiveQuery(async () => {
    if (!vectorContext) return;
    return await db.knowledge
      .where('workspaceId')
      .equals(workspaceId)
      .toArray();
  });

  const navigate = useNavigate();
  const { appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [agentState] = useActor(globalServices.agentStateService);
  const [userName] = useLocalStorageKeyValue('USER_NAME', '');
  const [userLocation] = useLocalStorageKeyValue('USER_LOCATION', '');
  const currentAgent = agentState.context[workspaceId];
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState('');
  const { addTaskAndRun } = useCrewAi();
  // const [abortController, setAbortController] =
  //   useState<AbortController | null>(null);

  const formattedChatHistory = currentAgent?.recentChatHistory
    ? currentAgent.recentChatHistory
        .map(
          (chat: { type: MessageRole; text: string }) =>
            `${chat.type}: ${chat.text}`,
        )
        .join('\n')
    : '';

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { editor } = useContext(EditorContext)!;

  const queryAva = async ({
    message,
    systemMessage: customPrompt,
    override,
    args,
  }: {
    message: string;
    systemMessage: string;
    override?: string;
    args?: { [key: string]: string };
  }): Promise<AvaChatResponse> => {
    setLoading(true);

    const mode = currentAgent.agentMode;
    switch (override ?? mode) {
      case 'chat': {
        // if the user has a custom prompt we override the system prompt
        const sysMessage = customPrompt
          ? await createCustomPrompt(customPrompt, '') //formattedChatHistory)
          : await createAvaChatPrompt(
              userName || 'User',
              userLocation || 'Undisclosed',
              '',
              // formattedChatHistory,
            );
        // console.log(currentAgent?.recentChatHistory)
        try {
          const response = await queryChat({
            systemMessage: sysMessage,
            message,
            messages: currentAgent?.recentChatHistory.map((msg: Message) =>
              msg.type === 'user'
                ? new HumanMessage(msg.text)
                : new AIMessage(msg.text),
            ),
            modelName: currentAgent.openAIChatModel,
            callbacks: {
              handleLLMStart: () => {
                setLoading(true);
                // console.log({ llm, prompts });
              },
              handleLLMNewToken: (token) => {
                setStreamingMessage((prev) => prev + token);
                // console.log(token);
              },
              handleLLMEnd: () => {
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

          // setAbortController(response.abortController);
          return {
            response: response.response,
            // abortController: response.abortController,
          };
        } catch (error: any) {
          setLoading(false);
          return {
            response: error.message || 'Something went wrong',
          };
        }
      }
      case 'crew': {
        if (!crews) {
          setLoading(false);
          return {
            response: 'No crews found',
          };
        }
        setLoading(true);
        const crewId = localStorage.getItem('currentCrew') || crews[0].id;
        const crew = crews.find((c) => c.id === crewId) || crews[0];
        if (!crew) {
          setLoading(false);
          return {
            response: 'No crews found',
          };
        }
        try {
          const task: Task = {
            id: Date.now().toString(),
            name: 'Answer the users query',
            description: message,
            agent: crew.agents[0].role || 'agent',
            tools: [],
            files: [],
            metadata: {},
          };

          const response = await addTaskAndRun({
            crewId,
            task,
          });
          setLoading(false);
          return { response: response.response };
        } catch (error: any) {
          setLoading(false);
          return error.message;
        }
      }
      case 'proto': {
        const response = await protoAgentResponse({
          query: message,
          chatHistory: '',
          context: protoState.context.fileContent || '',
          callbacks: {
            handleProtoResponse: (response) => {
              globalServices.protoStateService.send({
                type: 'UPDATE_FILE_CONTENT',
                fileContent: response,
              });
            },
            handleLLMStart: () => {
              setLoading(true);
              // console.log({ llm, prompts });
            },
            handleLLMNewToken: (token) => {
              setStreamingMessage((prev) => prev + token);
              // console.log(token);
            },
            handleLLMEnd: () => {
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

        setLoading(false);
        return {
          response: response.content,
          // abortController: null,
        };
      }
      // maps to rag agent
      case 'knowledge': {
        if (!vectorContext) {
          setError('Vector context not found');
          setLoading(false);
          return {
            response:
              'The vectorstore is not connected, please try reloading the page.',
          };
        }
        const contextResults = await vectorContext.similaritySearchWithScore(
          message,
        );

        const formattedResults = vectorContext.filterAndCombineContent(
          contextResults,
          0.4,
        );
        const response = await ragAgentResponse({
          query: message,
          chatHistory: formattedChatHistory,
          context: formattedResults,
          callbacks: {
            handleLLMStart: () => {
              setLoading(true);
              // console.log({ llm, prompts });
            },
            handleLLMNewToken: (token) => {
              setStreamingMessage((prev) => prev + token);
              // console.log(token);
            },
            handleLLMEnd: () => {
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
        if (agentState.context[workspaceId].returnRagResults) {
          const newTab: ACDoc = {
            id: Date.now().toString(),
            title: 'Retrieval Results',
            content: formattedResults,
            workspaceId,
            isContext: false,
            createdAt: new Date().toString(),
            lastUpdated: new Date().toString(),
            filetype: 'md',
            autoSave: false,
            canEdit: true,
            systemNote: '',
          };
          appStateService.send({ type: 'ADD_DOC', doc: newTab });
          navigate(`/${workspaceId}/documents/${newTab.id}`); // setAbortController(response.abortController);
        }

        return {
          response: response.content,
          // abortController: response.abortController,
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
              const tab = await handleCreateDoc(
                { title, content },
                workspaceId,
              );
              globalServices.appStateService.send({
                type: 'ADD_DOC',
                doc: tab,
              });
              setTimeout(() => {
                navigate(`/${workspaceId}/documents/${tab.id}`);
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
          // abortController: null,
        };
      }
      case 'custom': {
        let knowledge = '';
        if (vectorContext && currentAgent?.customAgentVectorSearch) {
          const contextResults = await vectorContext.similaritySearchWithScore(
            message,
          );
          const formattedResults = vectorContext.filterAndCombineContent(
            contextResults,
            0.4,
          );
          knowledge = formattedResults;
        }
        const agentPayload = {
          userMessage: message,
          userName: userName || 'User',
          userLocation: userLocation || 'Undisclosed',
          customPrompt,
          chatHistory: currentAgent?.recentChatHistory as Message[],
          currentDocument: editor?.getText() || '',
          similaritySearchResults: knowledge,
        };
        const agentUrl =
          getToken('CUSTOM_SERVER_URL') ||
          import.meta.env.VITE_CUSTOM_AGENT_URL;

        if (!agentUrl) {
          return {
            response: 'Please set a custom agent URL in the settings menu',
            // abortController: null,
          };
        }

        setLoading(true);
        try {
          const res = await axios.post(`${agentUrl}/v1/agent`, agentPayload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const { response } = res.data;
          setLoading(false);

          return { response };
        } catch (error: any) {
          setLoading(false);
          return error.message;
        }
      }
      // case 'crew': {
      //   if (!crews) {
      //     setLoading(false);
      //     return {
      //       response: 'No crews found',
      //     };
      //   }
      //   setLoading(true);
      //   try {
      //     const task: Task = {
      //       id: Date.now().toString(),
      //       name: 'Answer the users query',
      //       description: message,
      //       agent: crews[0].agents[0].role,
      //       tools: [],
      //       files: [],
      //       metadata: {},
      //     };

      //     const response = await addTaskAndRun({
      //       crewId: crews[0].id,
      //       task,
      //     });
      //     setLoading(false);
      //     return { response: response.response };
      //   } catch (error: any) {
      //     setLoading(false);
      //     return error.message;
      //   }
      // }

      default: {
        setLoading(false);
        throw new Error(`Unexpected agentMode: ${currentAgent.agentMode}`);
      }
    }
  };

  return { queryAva, loading, streamingMessage, error };
};
