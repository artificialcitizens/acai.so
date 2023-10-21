import { createMachine, assign, actions } from 'xstate';
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
  canEdit: boolean;
};

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
  private: boolean;
  data: {
    tiptap: {
      tabs: Tab[];
    };
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
  console.log('saving state', state);
  localStorage.setItem('appState', JSON.stringify(state));
};

const saveStateAction = (context: IContext) => {
  saveState(context);
  return context;
};

const { pure } = actions;

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

// Define the initial context
const initialContext: IContext = loadState() || {
  activeWorkspaceId: 'UUIDxyz',
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
      },
    },
  },
};
// Create the machine
export const appStateMachine = createMachine<IContext, Event>({
  predictableActionArguments: true,
  id: 'appState',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {},
  },
  on: {
    UPDATE_NAME: {
      actions: assign((context, event) => {
        const updatedContext = { ...context, userName: event.userName };
        saveState(updatedContext);
        return updatedContext;
      }),
    },
    UPDATE_LOCATION: {
      actions: assign((context, event) => {
        const updatedContext = {
          ...context,
          currentLocation: event.currentLocation,
        };
        saveState(updatedContext);
        return updatedContext;
      }),
    },
    UPDATE_TIME: {
      actions: assign((context, event) => {
        const updatedContext = { ...context, localTime: event.localTime };
        saveState(updatedContext);
        return updatedContext;
      }),
    },
    ADD_WORKSPACE: {
      actions: assign((context, event) => {
        const newWorkspace = event.workspace;
        console.log('new workspace', newWorkspace);
        const newContext = {
          ...context,
          activeWorkspaceId: newWorkspace.id,
          workspaces: {
            ...context.workspaces,
            [newWorkspace.id]: newWorkspace,
          },
        };
        console.log('new context', newContext);
        saveState(newContext);
        return newContext;
      }),
    },
    UPDATE_WORKSPACE: {
      actions: assign((context, event) => {
        const updatedWorkspace = event.workspace;
        const id = event.id;
        const updatedWorkspaces = {
          ...context.workspaces,
          [id]: { ...context.workspaces[id], ...updatedWorkspace },
        };
        const updatedContext = { ...context, workspaces: updatedWorkspaces };
        saveState(updatedContext);
        return updatedContext;
      }),
    },
    REPLACE_WORKSPACE: {
      actions: assign((context, event) => {
        const replacedWorkspace = event.workspace;
        const id = event.id;
        const updatedWorkspaces = {
          ...context.workspaces,
          [id]: replacedWorkspace,
        };
        const updatedContext = { ...context, workspaces: updatedWorkspaces };
        saveState(updatedContext);
        return updatedContext;
      }),
    },
    DELETE_WORKSPACE: {
      actions: assign((context, event) => {
        const workspaceId = event.id;
        if (context.workspaces[workspaceId]) {
          const newWorkspaces = { ...context.workspaces };
          delete newWorkspaces[workspaceId];
          const updatedContext = { ...context, workspaces: newWorkspaces };
          saveState(updatedContext);
          return updatedContext;
        }
        return context;
      }),
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
  canEdit = true,
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
    canEdit,
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
            autoSave: true,
            canEdit: true,
            filetype: 'markdown',
          },
        ],
      },
    },
  };

  return newWorkspace;
};
