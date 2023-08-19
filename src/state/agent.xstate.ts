import { createMachine, assign } from 'xstate';

export interface ChatHistory {
  id: string;
  text: string;
  timestamp: string;
  type: 'user' | 'ava';
}

export const agentMode = [
  'chat',
  // 'researcher',
  // 'assistant',
  'writing-assistant',
  // 'custom',
];

export type AgentMode = (typeof agentMode)[number];

export type AgentContext = {
  id: string;
  loading: boolean;
  agentMode: AgentMode;
  workspaceId: string;
  systemNotes: string;
  recentChatHistory: ChatHistory[];
  openAIChatModel: string;
  agentLogs: {
    [key: string]: any;
  };
  agentTools: {
    [key: string]: {
      enabled: boolean;
      settings: object;
    };
  };
};

type AgentWorkspace = {
  [key: string]: AgentContext;
};

type AgentEvent =
  | { type: 'LOAD'; workspaceId: string }
  | { type: 'UPDATE'; agent: Partial<AgentContext> }
  | { type: 'TOGGLE_TOOL'; toolName: string }
  | { type: 'UPDATE_SYSTEM_NOTES'; workspaceId: string; systemNotes: string }
  | {
      type: 'UPDATE_CHAT_HISTORY';
      workspaceId: string;
      recentChatHistory: ChatHistory[];
    }
  | { type: 'CREATE_AGENT'; workspaceId: string }
  | { type: 'CLEAR_CHAT_HISTORY'; workspaceId: string }
  | { type: 'SET_OPENAI_CHAT_MODEL'; workspaceId: string; modelName: string }
  | { type: 'SET_AGENT_MODE'; workspaceId: string; mode: AgentMode };

/**
 * Save AgentWorkspace to local storage
 */
const saveAgentState = (state: AgentWorkspace) => {
  localStorage.setItem('agentState', JSON.stringify(state));
};

/**
 * Load AgentWorkspace from local storage
 */
const loadAgentState = (): AgentWorkspace => {
  const savedState = localStorage.getItem('agentState');
  if (savedState) {
    return JSON.parse(savedState);
  } else {
    const initialState: AgentWorkspace = {
      UUIDxyz: {
        id: 'UUIDxyzzd',
        loading: false,
        workspaceId: 'UUIDxyz',
        agentMode: 'chat',
        openAIChatModel: 'gpt-4',
        systemNotes: '',
        recentChatHistory: [],
        agentLogs: {},
        agentTools: {},
      },
    }; // Define your initial state here
    saveAgentState(initialState);
    return initialState;
  }
};

export const createAgent = (workspaceId: string): AgentContext => {
  return {
    id: workspaceId,
    loading: false,
    workspaceId: workspaceId,
    agentMode: 'chat',
    systemNotes: '',
    openAIChatModel: 'gpt-4',
    recentChatHistory: [],
    agentLogs: {},
    agentTools: {},
  };
};

// Define the initial context
const initialAgentContext: AgentWorkspace = loadAgentState();

// Define the machine
export const agentMachine = createMachine<AgentWorkspace, AgentEvent>({
  id: 'agent',
  initial: 'idle',
  context: initialAgentContext,
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
              saveAgentState(updatedContext);
              return updatedContext;
            }
            return context;
          }),
        },
      },
    },
    loading: {
      on: {
        UPDATE: {
          target: 'idle',
          actions: assign((context, event) => {
            if (event.agent.workspaceId) {
              const updatedContext = {
                ...context,
                [event.agent.workspaceId]: {
                  ...context[event.agent.workspaceId],
                  ...event.agent,
                  loading: false,
                },
              };
              saveAgentState(updatedContext);
              return updatedContext;
            }
            return context;
          }),
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
              saveAgentState(updatedContext);
              return updatedContext;
            }
            return context;
          }),
        },
      },
    },
  },
  on: {
    UPDATE_SYSTEM_NOTES: {
      actions: assign((context, event) => {
        if (event.workspaceId && context[event.workspaceId]) {
          const updatedContext = {
            ...context,
            [event.workspaceId]: {
              ...context[event.workspaceId],
              systemNotes: event.systemNotes,
            },
          };
          saveAgentState(updatedContext);
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
          saveAgentState(updatedContext);
          return updatedContext;
        }
        return context;
      }),
    },
    TOGGLE_TOOL: {
      actions: assign((context, event) => {
        const workspaceIds = Object.keys(context);
        for (const workspaceId of workspaceIds) {
          const tool = context[workspaceId].agentTools[event.toolName];
          if (tool) {
            tool.enabled = !tool.enabled;
          }
        }
        saveAgentState(context);
        return context;
      }),
    },
    CREATE_AGENT: {
      actions: assign((context, event) => {
        const newAgent = createAgent(event.workspaceId);
        const updatedContext = {
          ...context,
          [event.workspaceId]: newAgent,
        };
        saveAgentState(updatedContext);
        return updatedContext;
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
          saveAgentState(updatedContext);
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
          saveAgentState(updatedContext);
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
          saveAgentState(updatedContext);
          return updatedContext;
        }
        return context;
      }),
    },
  },
});
