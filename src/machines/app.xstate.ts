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
  getWorkspaceById: (id: string) => Workspace | undefined;
}

type Event =
  | { type: 'UPDATE_NAME'; userName: string }
  | { type: 'UPDATE_LOCATION'; currentLocation: string }
  | { type: 'UPDATE_TIME'; localTime: string }
  | { type: 'ADD_WORKSPACE'; workspace: Workspace }
  | { type: 'UPDATE_WORKSPACE'; id: string; workspace: Partial<Workspace> }
  | { type: 'DELETE_WORKSPACE'; id: string }
  | { type: 'ADD_TAB'; tab: any }
  | { type: 'DELETE_TAB'; id: string }
  | { type: 'UPDATE_TAB_CONTENT'; id: string; content: any; workspaceId: string }
  | { type: 'SET_ACTIVE_WORKSPACE'; id: string }
  | { type: 'SET_ACTIVE_TAB'; id: string; workspaceId: string }
  | { type: 'UPDATE_NOTES'; id: string; notes: string };

/**
 * Save state to local storage
 */
export const saveState = (state: IContext) => {
  localStorage.setItem('appState', JSON.stringify(state));
};

/**
 * Load state from local storage
 */
export const loadState = (): IContext | undefined => {
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    return JSON.parse(savedState);
  }
};

// Create the machine
export const appStateMachine = createMachine<IContext, Event>({
  id: 'appState',
  initial: 'idle',
  context: loadState() || {
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
                content: 'Hello World!',
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
    getWorkspaceById: (id: string) => {
      const savedState = loadState();
      if (savedState) {
        return savedState.workspaces.find((workspace) => workspace.id === id);
      }
      return undefined;
    },
  },
  states: {
    idle: {
      on: {
        UPDATE_NAME: {
          actions: [
            assign((context, event) => ({ ...context, userName: event.userName })),
            (context, event) => saveState(context),
          ],
        },
        UPDATE_LOCATION: {
          actions: [
            assign((context, event) => ({
              ...context,
              currentLocation: event.currentLocation,
            })),
            (context, event) => saveState(context),
          ],
        },
        UPDATE_TIME: {
          actions: [
            assign((context, event) => ({ ...context, localTime: event.localTime })),
            (context, event) => saveState(context),
          ],
        },
        ADD_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const newWorkspace = event.workspace;
              const newContext = { ...context, workspaces: [...context.workspaces, newWorkspace] };
              console.log('Current context', context);
              console.log('New context', newContext);
              return newContext;
            }),
            (context, event) => saveState(context),
          ],
        },

        UPDATE_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const updatedWorkspace = event.workspace;
              const id = event.id;
              const updatedWorkspaces = context.workspaces.map((workspace) =>
                workspace.id === id ? { ...workspace, ...updatedWorkspace } : workspace,
              );
              return { ...context, workspaces: updatedWorkspaces };
            }),
            (context, event) => saveState(context),
          ],
        },
        DELETE_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const id = event.id;
              const updatedWorkspaces = context.workspaces.filter((workspace) => workspace.id !== id);
              return { ...context, workspaces: updatedWorkspaces };
            }),
            (context, event) => saveState(context),
          ],
        },
        ADD_TAB: {
          actions: [
            assign((context, event) => {
              const newTab = event.tab;
              // Find the workspace that the new tab belongs to
              const workspace = context.workspaces.find((ws) => ws.id === newTab.workspaceId);
              if (workspace) {
                // Add the new tab to the workspace
                workspace.data.tiptap.tabs.push(newTab);
              }
              return { ...context };
            }),
            (context, event) => saveState(context),
          ],
        },
        DELETE_TAB: {
          actions: [
            assign((context, event) => {
              const id = event.id;
              // Remove the tab from all workspaces
              context.workspaces.forEach((workspace) => {
                workspace.data.tiptap.tabs = workspace.data.tiptap.tabs.filter((tab) => tab.id !== id);
              });
              return { ...context };
            }),
            (context, event) => saveState(context),
          ],
        },
        UPDATE_TAB_CONTENT: {
          actions: [
            assign((context, event) => {
              const { id, content, workspaceId } = event;
              // Find the workspace that the updated tab belongs to
              const workspace = context.workspaces.find((ws) => ws.id === workspaceId);
              if (workspace) {
                // Find the tab and update its content
                const tab = workspace.data.tiptap.tabs.find((tab) => tab.id === id);
                if (tab) {
                  tab.content = content;
                }
              }
              return { ...context };
            }),
            (context, event) => saveState(context),
          ],
        },
        SET_ACTIVE_TAB: {
          actions: [
            assign((context, event) => {
              const { id, workspaceId } = event;
              console.log('workspaceId:', workspaceId, 'id:', id);

              // Find the workspace that the updated tab belongs to
              const workspace = context.workspaces.find((ws) => ws.id === workspaceId);
              console.log('workspace:', workspace);

              if (workspace) {
                // Find the tab and update its content
                const tab = workspace.data.tiptap.tabs.find((tab) => tab.id === id);
                console.log('tab:', tab);

                if (tab) {
                  workspace.currentTab = Number(tab.id);
                }
              }

              const newContext = { ...context };
              console.log('newContext:', newContext);

              return newContext;
            }),
            (context, event) => saveState(context),
          ],
        },
        SET_ACTIVE_WORKSPACE: {
          actions: [
            assign((context, event) => {
              console.log(event.id, context.activeWorkspaceId);
              context.activeWorkspaceId = event.id;
              return context;
            }),
            (context, event) => saveState(context),
          ],
        },
        UPDATE_NOTES: {
          actions: [
            assign((context, event) => {
              const { id, notes } = event;
              // Find the workspace that the notes belong to
              const workspace = context.workspaces.find((ws) => ws.id === id);
              if (workspace) {
                // Update the notes
                workspace.data.notes = notes;
              }
              return { ...context };
            }),
            (context, event) => saveState(context),
          ],
        },
      },
    },
  },
});

export const getWorkspaceById = (workspaces: Workspace[], id: string): Workspace | undefined => {
  return workspaces.find((workspace) => workspace.id === id);
};
