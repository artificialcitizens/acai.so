import { createMachine, assign } from 'xstate';
import { timestampToHumanReadable } from '../utils/data-utils';

export interface Workspace {
  id: string;
  name: string;
  currentTab: number;
  createdAt: string;
  lastUpdated: string;
  private: boolean;
  settings: {
    webSpeechRecognition: boolean;
    tts: boolean;
    whisper: boolean;
  };
  data: {
    tiptap: {
      tabs: {
        id: string;
        name: string;
        content: any;
      }[];
    };
    chat: any;
    agentLogs: {
      thoughts: any;
      errors: any;
    };
    agentTools: {
      calculator: boolean;
      weather: boolean;
      googleSearch: boolean;
      webBrowser: boolean;
      createDocument: boolean;
    };
    notes: string;
  };
}

interface IContext {
  userName: string;
  currentLocation: string;
  localTime: string;
  activeWorkspaceId: string;
  workspaces: Workspace[];
}

// Define events
//type UpdateNameEvent = { type: 'UPDATE_NAME'; userName: string };
type UpdateLocationEvent = { type: 'UPDATE_LOCATION'; currentLocation: string };
type UpdateTimeEvent = { type: 'UPDATE_TIME'; localTime: string };
type AddWorkspaceEvent = { type: 'ADD_WORKSPACE'; workspace: Workspace };
type UpdateWorkspaceEvent = { type: 'UPDATE_WORKSPACE'; id: string; workspace: Partial<Workspace> };
type DeleteWorkspaceEvent = { type: 'DELETE_WORKSPACE'; id: string };
type AddTabEvent = { type: 'ADD_TAB'; tab: any };
type DeleteTabEvent = { type: 'DELETE_TAB'; id: string };
type UpdateTabContentEvent = { type: 'UPDATE_TAB_CONTENT'; id: string; content: any };

type Event =
  | { type: 'UPDATE_NAME'; userName: string }
  | UpdateLocationEvent
  | UpdateTimeEvent
  | AddWorkspaceEvent
  | UpdateWorkspaceEvent
  | DeleteWorkspaceEvent
  | AddTabEvent
  | DeleteTabEvent
  | UpdateTabContentEvent;

// Create the machine
export const appStateMachine = createMachine<IContext, Event>({
  id: 'appState',
  initial: 'idle',
  context: {
    userName: 'Josh Mabry',
    activeWorkspaceId: 'UUIDxyz',
    currentLocation: '',
    localTime: timestampToHumanReadable(),
    workspaces: [
      {
        id: 'UUIDxyz',
        name: 'Knapsack',
        currentTab: 0,
        createdAt: timestampToHumanReadable(),
        lastUpdated: timestampToHumanReadable(),
        private: true,
        settings: {
          webSpeechRecognition: true,
          tts: false,
          whisper: false,
        },
        data: {
          tiptap: {
            tabs: [
              {
                id: 'UUIDabc',
                name: 'Home',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Welcome to Knapsack!',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          chat: {},
          agentLogs: {
            thoughts: {},
            errors: {},
          },
          agentTools: {
            calculator: true,
            weather: true,
            googleSearch: true,
            webBrowser: true,
            createDocument: true,
          },
          notes: '',
        },
      },
    ],
  },
  states: {
    idle: {
      on: {
        UPDATE_NAME: {
          actions: assign((context, event) => ({ ...context, userName: event.userName })),
        },
        UPDATE_LOCATION: {
          actions: assign((context, event) => ({
            ...context,
            currentLocation: (event as UpdateLocationEvent).currentLocation,
          })),
        },
        UPDATE_TIME: {
          actions: assign((context, event) => ({ ...context, localTime: (event as UpdateTimeEvent).localTime })),
        },
        ADD_WORKSPACE: {
          actions: assign((context, event) => {
            const newWorkspace = (event as AddWorkspaceEvent).workspace;
            const newContext = { ...context, workspaces: [...context.workspaces, newWorkspace] };
            console.log('Current context', context);
            console.log('New context', newContext);
            return newContext;
          }),
        },

        UPDATE_WORKSPACE: {
          actions: assign((context, event) => {
            const updatedWorkspace = (event as UpdateWorkspaceEvent).workspace;
            const id = (event as UpdateWorkspaceEvent).id;
            const updatedWorkspaces = context.workspaces.map((workspace) =>
              workspace.id === id ? { ...workspace, ...updatedWorkspace } : workspace,
            );
            return { ...context, workspaces: updatedWorkspaces };
          }),
        },
        DELETE_WORKSPACE: {
          actions: assign((context, event) => {
            const id = (event as DeleteWorkspaceEvent).id;
            const updatedWorkspaces = context.workspaces.filter((workspace) => workspace.id !== id);
            return { ...context, workspaces: updatedWorkspaces };
          }),
        },
        ADD_TAB: {
          actions: assign((context, event) => {
            const newTab = (event as AddTabEvent).tab;
            // Assuming each workspace has a tabs array
            context.workspaces.forEach((workspace) => {
              if (workspace.id === newTab.workspaceId) {
                workspace.data.tiptap.tabs = [...workspace.data.tiptap.tabs, newTab];
              }
            });
            return { ...context };
          }),
        },
        DELETE_TAB: {
          actions: assign((context, event) => {
            const id = (event as DeleteTabEvent).id;
            context.workspaces.forEach((workspace) => {
              workspace.data.tiptap.tabs = workspace.data.tiptap.tabs.filter((tab) => tab.id !== id);
            });
            return { ...context };
          }),
        },
        UPDATE_TAB_CONTENT: {
          actions: assign((context, event) => {
            const { id, content } = event as UpdateTabContentEvent;
            context.workspaces.forEach((workspace) => {
              workspace.data.tiptap.tabs.forEach((tab) => {
                if (tab.id === id) {
                  tab.content = content;
                }
              });
            });
            return { ...context };
          }),
        },
      },
    },
  },
});
