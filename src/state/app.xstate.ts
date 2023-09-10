import { createMachine, assign } from 'xstate';
import { timestampToHumanReadable } from '../utils/data-utils';
import { v4 as uuidv4 } from 'uuid';
import { docsContent } from './fixture/docs';

export type Tab = {
  id: string;
  workspaceId: string;
  title: string;
  filetype: string;
  content: any;
  isContext: boolean;
  systemNote: string;
  createdAt: string;
  lastUpdated: string;
  autoSave: boolean;
};

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
  private: boolean;
  settings?: {
    webSpeechRecognition: boolean;
    tts: boolean;
    whisper: boolean;
  };
  data: {
    tiptap: {
      tabs: Tab[];
    };
    chat?: any;
    agentLogs?: {
      thoughts: any;
      errors: any;
    };
    agentTools?: {
      calculator: boolean;
      weather: boolean;
      googleSearch: boolean;
      webBrowser: boolean;
      createDocument: boolean;
    };
    notes: string;
  };
}

type WorkspaceDictionary = {
  [key: string]: Workspace;
};

interface IContext {
  userName: string;
  currentLocation: string;
  localTime: string;
  activeWorkspaceId: string;
  activeTabId: string;
  workspaces: WorkspaceDictionary;
}

type Event =
  | { type: 'UPDATE_NAME'; userName: string }
  | { type: 'UPDATE_LOCATION'; currentLocation: string }
  | { type: 'UPDATE_TIME'; localTime: string }
  | { type: 'ADD_WORKSPACE'; workspace: Workspace }
  | { type: 'UPDATE_WORKSPACE'; id: string; workspace: Partial<Workspace> }
  | { type: 'REPLACE_WORKSPACE'; id: string; workspace: Workspace }
  | { type: 'DELETE_WORKSPACE'; id: string; workspaceId: string }
  | { type: 'ADD_TAB'; tab: any }
  | { type: 'DELETE_TAB'; id: string; workspaceId: string }
  | {
      type: 'UPDATE_TAB_CONTENT';
      id: string;
      content: any;
      workspaceId: string;
    }
  | { type: 'SET_ACTIVE_WORKSPACE'; workspaceId: string }
  | {
      type: 'SET_ACTIVE_TAB';
      tabId: string;
    }
  | { type: 'TOGGLE_CONTEXT'; id: string; workspaceId: string }
  | {
      type: 'UPDATE_TAB_SYSTEM_NOTE';
      id: string;
      systemNote: string;
      workspaceId: string;
    };

/**
 * Save state to local storage
 */
export const saveState = (state: IContext) => {
  localStorage.setItem('appState', JSON.stringify(state));
};

/**
 * Load state from local storage
 */
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('appState');
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return null;
  }
};

// Create the machine
export const appStateMachine = createMachine<IContext, Event>({
  id: 'appState',
  initial: 'idle',
  context: loadState() || {
    activeWorkspaceId: 'UUIDxyz',
    activeTabId: 'UUIDabc',
    currentLocation: '',
    localTime: timestampToHumanReadable(),
    workspaces: {
      docs: {
        id: 'docs',
        name: 'acai.so',
        createdAt: timestampToHumanReadable(),
        lastUpdated: timestampToHumanReadable(),
        private: true,
        data: {
          tiptap: {
            tabs: [
              {
                id: 'introduction',
                title: 'Introduction',
                filetype: 'markdown',
                content: docsContent,
                isContext: false,
                systemNote: '',
                workspaceId: 'docs',
                autoSave: false,
                createdAt: timestampToHumanReadable(),
                lastUpdated: timestampToHumanReadable(),
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
    },
  },
  states: {
    idle: {
      on: {
        UPDATE_NAME: {
          actions: [
            assign((context, event) => ({
              ...context,
              userName: event.userName,
            })),
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
            assign((context, event) => ({
              ...context,
              localTime: event.localTime,
            })),
            (context, event) => saveState(context),
          ],
        },
        ADD_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const newWorkspace = event.workspace;
              console.log(context);
              const newContext = {
                ...context,
                activeWorkspaceId: newWorkspace.id,
                workspaces: {
                  ...context.workspaces,
                  [newWorkspace.id]: newWorkspace,
                },
              };
              console.log(newContext);
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
              const updatedWorkspaces = {
                ...context.workspaces,
                [id]: { ...context.workspaces[id], ...updatedWorkspace },
              };
              return { ...context, workspaces: updatedWorkspaces };
            }),
            (context, event) => saveState(context),
          ],
        },
        REPLACE_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const replacedWorkspace = event.workspace;
              const id = event.id;
              const updatedWorkspaces = {
                ...context.workspaces,
                [id]: replacedWorkspace, // This line completely replaces the workspace with the new one.
              };
              return { ...context, workspaces: updatedWorkspaces };
            }),
            (context, event) => saveState(context),
          ],
        },
        DELETE_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const workspaceId = event.id;
              if (context.workspaces[workspaceId]) {
                // Create a new workspaces object without the deleted workspace
                const newWorkspaces = { ...context.workspaces };
                delete newWorkspaces[workspaceId];
                return { ...context, workspaces: newWorkspaces };
              }
              return context;
            }),
            (context, event) => saveState(context),
          ],
        },
        ADD_TAB: {
          actions: [
            assign((context, event) => {
              const newTab = event.tab;
              const workspace = context.workspaces[newTab.workspaceId];
              if (workspace) {
                // Create a new array with the new tab
                workspace.data.tiptap.tabs = [
                  ...workspace.data.tiptap.tabs,
                  newTab,
                ];
                // Create a new workspace object with the updated tabs
                const newWorkspace = {
                  ...workspace,
                  data: {
                    ...workspace.data,
                    tiptap: {
                      ...workspace.data.tiptap,
                      tabs: workspace.data.tiptap.tabs,
                    },
                  },
                };
                // Create a new workspaces object with the updated workspace
                const newWorkspaces = {
                  ...context.workspaces,
                  [newTab.workspaceId]: newWorkspace,
                };
                return { ...context, workspaces: newWorkspaces };
              }
              return context;
            }),
            (context, event) => {
              event.tab.autoSave && saveState(context);
            },
          ],
        },
        DELETE_TAB: {
          actions: [
            assign((context, event) => {
              const id = event.id;
              Object.values(context.workspaces).forEach((workspace) => {
                workspace.data.tiptap.tabs = workspace.data.tiptap.tabs.filter(
                  (tab) => tab.id !== id,
                );
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
              const workspace = context.workspaces[workspaceId];
              if (workspace) {
                const tab = workspace.data.tiptap.tabs.find(
                  (tab) => tab.id === id,
                );
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
            assign({
              activeTabId: (context, event) => event.tabId,
            }),
            (context, event) => saveState(context),
          ],
        },

        SET_ACTIVE_WORKSPACE: {
          actions: [
            assign({
              activeWorkspaceId: (context, event) => event.workspaceId,
            }),
            (context, event) => {
              console.log('set active workspace', context, event);
              saveState(context);
            },
          ],
        },
      },
    },
  },
});

// Load state from local storage
const loadedState = loadState();

// If there is no loaded state, save the initial state
if (loadedState === null) {
  saveState(appStateMachine.context);
}

export const handleCreateTab = async (
  args: { title: string; content: string },
  workspaceId: string,
  filetype = 'markdown',
  autoSave = true,
): Promise<Tab> => {
  const newTab = {
    id: uuidv4().split('-')[0],
    title: args.title,
    content: args.content,
    isContext: false,
    systemNote: '',
    workspaceId,
    autoSave,
    filetype,
    createdAt: new Date().toString(),
    lastUpdated: new Date().toString(),
  };
  return newTab;
};

export const createWorkspace = ({
  workspaceName,
  id,
  content,
}: {
  workspaceName: string;
  id?: string;
  content?: Tab[];
}): Workspace | undefined => {
  const newId = id || uuidv4().split('-')[0];
  const tabId = uuidv4().split('-')[0];
  const newWorkspace: Workspace = {
    id: newId,
    name: workspaceName,
    createdAt: new Date().toString(),
    lastUpdated: new Date().toString(),
    private: false,
    data: {
      tiptap: {
        tabs: content || [
          {
            id: tabId,
            title: `Welcome to ${workspaceName}!`,
            content: '',
            isContext: false,
            systemNote: '',
            workspaceId: newId,
            createdAt: new Date().toString(),
            lastUpdated: new Date().toString(),
            autoSave: false,
            filetype: 'markdown',
          },
        ],
      },
      notes: '',
    },
  };

  return newWorkspace;
};
