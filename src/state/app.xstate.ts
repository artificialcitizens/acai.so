import { createMachine, assign } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

export type DocType = {
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
  docs: DocType[];
}

type WorkspaceDictionary = {
  [key: string]: Workspace;
};

export interface AppContext {
  workspaces: WorkspaceDictionary;
}

export type AppEvent =
  | { type: 'ADD_WORKSPACE'; workspace: Workspace }
  | { type: 'UPDATE_WORKSPACE'; id: string; workspace: Partial<Workspace> }
  | { type: 'REPLACE_WORKSPACE'; id: string; workspace: Workspace }
  | { type: 'DELETE_WORKSPACE'; workspaceId: string }
  | { type: 'ADD_TAB'; tab: DocType }
  | { type: 'DELETE_TAB'; id: string; workspaceId: string }
  | {
      type: 'UPDATE_TAB_CONTENT';
      id: string;
      content: any;
      workspaceId: string;
    };

export const saveState = (state: AppContext) => {
  localStorage.setItem('appState', JSON.stringify(state));
};

export const loadState = () => {
  const serializedState = localStorage.getItem('appState');
  return JSON.parse(serializedState || '{}');
};

// Define the initial context
const initialContext: AppContext = loadState() || {
  id: 'docs',
  name: 'acai.so',
  createdAt: new Date().toString(),
  lastUpdated: new Date().toString(),
  private: true,
  docs: [],
};
// Create the machine
export const appStateMachine = createMachine<AppContext, AppEvent>({
  predictableActionArguments: true,
  id: 'appState',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {},
  },
  on: {
    ADD_WORKSPACE: {
      actions: assign((context, event) => {
        const newWorkspace = event.workspace;
        const newContext = {
          ...context,
          workspaces: {
            ...context.workspaces,
            [newWorkspace.id]: newWorkspace,
          },
        };
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
        const workspaceId = event.workspaceId;
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
            workspace.docs = [...workspace.docs, newTab];
            // Create a new workspace object with the updated tabs
            const newWorkspace: Workspace = {
              ...workspace,
              docs: workspace.docs,
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
            workspace.docs = workspace.docs.filter((tab) => tab.id !== id);
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
            const tab = workspace.docs.find((tab) => tab.id === id);
            if (tab) {
              tab.content = content;
            }
          }
          return { ...context };
        }),
        (context, event) => saveState(context),
      ],
    },
  },
});

export const handleCreateTab = async (
  args: { title: string; content: string },
  workspaceId: string,
  filetype = 'markdown',
  autoSave = true,
  canEdit = true,
): Promise<DocType> => {
  const newTab = {
    id: uuidv4(),
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
  content?: DocType[];
}): Workspace | undefined => {
  const newId = id || uuidv4();
  const tabId = uuidv4();
  const newWorkspace: Workspace = {
    id: newId,
    name: workspaceName,
    createdAt: new Date().toString(),
    lastUpdated: new Date().toString(),
    private: false,
    docs: content || [
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
  };

  return newWorkspace;
};
