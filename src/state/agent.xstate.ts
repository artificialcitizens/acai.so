import { createMachine, assign } from 'xstate';
import { MessageRole, agentMode } from '../components/Ava/use-ava';
import { db } from '../../db';

export interface ChatHistory {
  id: string;
  text: string;
  timestamp: string;
  type: MessageRole;
}

export type AgentMode = (typeof agentMode)[number];

export type AgentWorkspace = {
  id: string;
  loading: boolean;
  agentMode: AgentMode;
  agentName?: string;
  workspaceId: string;
  customPrompt: string;
  recentChatHistory: ChatHistory[];
  openAIChatModel: string;
  returnRagResults: boolean;
  customAgentVectorSearch: boolean;
  agentLogs: {
    [key: string]: any;
  };
  memory: {
    [key: string]: any;
  };
  agentTools: {
    [key: string]: {
      enabled: boolean;
      settings: object;
    };
  };
};

export type AgentContext = {
  [key: string]: AgentWorkspace;
};

export type AgentEvent =
  | { type: 'LOAD'; workspaceId: string }
  | { type: 'UPDATE'; agent: AgentWorkspace }
  | { type: 'TOGGLE_TOOL'; toolName: string; workspaceId: string }
  | { type: 'UPDATE_CUSTOM_PROMPT'; workspaceId: string; customPrompt: string }
  | {
      type: 'UPDATE_CHAT_HISTORY';
      workspaceId: string;
      recentChatHistory: ChatHistory[];
    }
  | { type: 'CREATE_AGENT'; workspaceId: string }
  | { type: 'CLEAR_CHAT_HISTORY'; workspaceId: string }
  | { type: 'SET_OPENAI_CHAT_MODEL'; workspaceId: string; modelName: string }
  | { type: 'SET_AGENT_MODE'; workspaceId: string; mode: AgentMode }
  | { type: 'SET_RAG_RESULTS'; workspaceId: string; ragResults: boolean }
  | {
      type: 'SET_CUSTOM_AGENT_VECTOR_SEARCH';
      workspaceId: string;
      ragResults: boolean;
    }
  | { type: 'DELETE_AGENT'; workspaceId: string };

export const agentDbService = {
  async saveAgent(agent: AgentWorkspace) {
    if (!agent.workspaceId) return;
    try {
      await db.agents.put(agent);
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  },

  async deleteAgent(agentId: string) {
    try {
      await db.agents.delete(agentId);
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  },

  async loadAgents(): Promise<{ [key: string]: AgentWorkspace }> {
    const agents = await db.agents.toArray();
    const agentDictionary: { [key: string]: AgentWorkspace } = {};

    agents.forEach((agent) => {
      agentDictionary[agent.id] = agent;
    });

    return agentDictionary;
  },
};

export const createAgent = (workspaceId: string): AgentWorkspace => {
  return {
    id: workspaceId,
    loading: false,
    workspaceId: workspaceId,
    agentMode: 'chat',
    customPrompt: '',
    openAIChatModel: 'gpt-4',
    returnRagResults: false,
    customAgentVectorSearch: false,
    memory: {},
    recentChatHistory: [],
    agentLogs: {},
    agentTools: {},
  };
};

// Define the machine
export const agentMachine = createMachine<AgentContext, AgentEvent>({
  predictableActionArguments: true,
  id: 'agent',
  initial: 'idle',
  context: undefined,
  states: {
    idle: {
      on: {
        LOAD: {
          target: 'loading',
          actions: assign((context, event) => {
            if (event.workspaceId) {
              const updatedContext = {
                ...context,
                [event.workspaceId]: {
                  ...context[event.workspaceId],
                  loading: true,
                },
              };
              agentDbService.saveAgent(updatedContext[event.workspaceId]);
              return updatedContext;
            }
            return context;
          }),
        },
      },
    },
    loading: {
      invoke: {
        id: 'loadAgents',
        src: () => agentDbService.loadAgents(),
        onDone: {
          target: 'idle',
          actions: assign((context, event) => {
            return event.data;
          }),
        },
        onError: {
          target: 'error',
          actions: (context, event) => {
            console.error('Error loading agents:', event.data);
          },
        },
      },
    },
    error: {
      on: {
        LOAD: {
          target: 'loading',
          actions: assign((context, event) => {
            if (event.workspaceId) {
              const updatedContext = {
                ...context,
                [event.workspaceId]: {
                  ...context[event.workspaceId],
                  loading: true,
                },
              };
              agentDbService.saveAgent(updatedContext[event.workspaceId]);
              return updatedContext;
            }
            return context;
          }),
        },
      },
    },
  },
  on: {
    UPDATE_CUSTOM_PROMPT: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              customPrompt: event.customPrompt,
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
    UPDATE_CHAT_HISTORY: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              recentChatHistory: event.recentChatHistory,
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
    TOGGLE_TOOL: {
      actions: assign((context, event) => {
        const workspaceIds = Object.keys(context);
        const updatedContext = { ...context };

        for (const workspaceId of workspaceIds) {
          const agentWorkspace = updatedContext[workspaceId];
          const tool = agentWorkspace.agentTools[event.toolName];
          if (tool) {
            // Create a new tool object with the updated enabled property
            const updatedTool = { ...tool, enabled: !tool.enabled };
            // Create a new agentTools object with the updated tool
            const updatedAgentTools = {
              ...agentWorkspace.agentTools,
              [event.toolName]: updatedTool,
            };
            // Create a new agentWorkspace object with the updated agentTools
            updatedContext[workspaceId] = {
              ...agentWorkspace,
              agentTools: updatedAgentTools,
            };
            agentDbService.saveAgent(updatedContext[workspaceId]);
          }
        }

        return updatedContext;
      }),
    },
    CREATE_AGENT: {
      actions: assign((context, event) => {
        const newAgent = createAgent(event.workspaceId);
        const updatedContext = {
          ...context,
          [event.workspaceId]: newAgent,
        };
        agentDbService.saveAgent(newAgent);
        return updatedContext;
      }),
    },
    DELETE_AGENT: {
      actions: assign((context, event) => {
        const workspaceId = event.workspaceId;
        if (context[workspaceId]) {
          const updatedContext = { ...context };
          delete updatedContext[workspaceId];
          agentDbService.deleteAgent(workspaceId);
          return updatedContext;
        }
        return context;
      }),
    },
    CLEAR_CHAT_HISTORY: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              recentChatHistory: [], // Clear the chat history
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
    SET_OPENAI_CHAT_MODEL: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              openAIChatModel: event.modelName,
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
    SET_AGENT_MODE: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              agentMode: event.mode,
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
    SET_RAG_RESULTS: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              returnRagResults: !context[event.workspaceId].returnRagResults,
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
    SET_CUSTOM_AGENT_VECTOR_SEARCH: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              customAgentVectorSearch:
                !context[event.workspaceId].customAgentVectorSearch,
            },
          };
          agentDbService.saveAgent(updatedContext[event.workspaceId]);
          return updatedContext;
        }
        return context;
      }),
    },
  },
});
