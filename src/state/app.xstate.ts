import { createMachine, assign } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

export type ACDoc = {
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
  docs: ACDoc[];
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
  | { type: 'ADD_TAB'; tab: ACDoc }
  | { type: 'DELETE_TAB'; id: string; workspaceId: string }
  | {
      type: 'UPDATE_TAB_CONTENT';
      id: string;
      content: any;
      workspaceId: string;
    };

export const saveState = (state: AppContext) => {
  console.log('Saving state:', state);
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
export const appStateMachine = createMachine<AppContext, AppEvent>(
  {
    predictableActionArguments: true,
    id: 'appState',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {},
    },
    on: {
      ADD_WORKSPACE: {
        actions: ['addWorkspace', 'saveState'],
      },
      UPDATE_WORKSPACE: {
        actions: ['updateWorkspace', 'saveState'],
      },
      REPLACE_WORKSPACE: {
        actions: ['replaceWorkspace', 'saveState'],
      },
      DELETE_WORKSPACE: {
        actions: ['deleteWorkspace', 'saveState'],
      },
      ADD_TAB: {
        actions: ['addTab', 'saveState'],
      },
      DELETE_TAB: {
        actions: ['deleteTab', 'saveState'],
      },
      UPDATE_TAB_CONTENT: {
        actions: ['updateTabContent', 'saveState'],
      },
    },
  },
  {
    actions: {
      addWorkspace: assign((context, event) => {
        if (event.type !== 'ADD_WORKSPACE') return context;
        console.log('Adding workspace:', event.workspace);
        const newWorkspace = event.workspace;
        const newContext = {
          ...context,
          workspaces: {
            ...context.workspaces,
            [newWorkspace.id]: newWorkspace,
          },
        };
        return newContext;
      }),
      updateWorkspace: assign((context, event) => {
        if (event.type !== 'UPDATE_WORKSPACE') return context;
        const updatedWorkspace = event.workspace;
        const id = event.id;
        const updatedWorkspaces = {
          ...context.workspaces,
          [id]: { ...context.workspaces[id], ...updatedWorkspace },
        };
        return { ...context, workspaces: updatedWorkspaces };
      }),
      replaceWorkspace: assign((context, event) => {
        if (event.type !== 'REPLACE_WORKSPACE') return context;
        const replacedWorkspace = event.workspace;
        const id = event.id;
        const updatedWorkspaces = {
          ...context.workspaces,
          [id]: replacedWorkspace,
        };
        return { ...context, workspaces: updatedWorkspaces };
      }),
      deleteWorkspace: assign((context, event) => {
        if (event.type !== 'DELETE_WORKSPACE') return context;
        const workspaceId = event.workspaceId;
        if (context.workspaces[workspaceId]) {
          const newWorkspaces = { ...context.workspaces };
          delete newWorkspaces[workspaceId];
          return { ...context, workspaces: newWorkspaces };
        }
        return context;
      }),
      addTab: assign((context, event) => {
        if (event.type !== 'ADD_TAB') return context;
        const newTab = event.tab;
        const workspace = context.workspaces[newTab.workspaceId];
        if (workspace) {
          workspace.docs = [...workspace.docs, newTab];
          const newWorkspace: Workspace = {
            ...workspace,
            docs: workspace.docs,
          };
          const newWorkspaces = {
            ...context.workspaces,
            [newTab.workspaceId]: newWorkspace,
          };
          return { ...context, workspaces: newWorkspaces };
        }
        return context;
      }),
      deleteTab: assign((context, event) => {
        if (event.type !== 'DELETE_TAB') return context;
        const id = event.id;
        Object.values(context.workspaces).forEach((workspace) => {
          workspace.docs = workspace.docs.filter((tab) => tab.id !== id);
        });
        return { ...context };
      }),
      updateTabContent: assign((context, event) => {
        if (event.type !== 'UPDATE_TAB_CONTENT') return context;
        const { id, content, workspaceId } = event;
        const workspace = context.workspaces[workspaceId];
        if (workspace) {
          const tab = workspace.docs.find((tab) => tab.id === id);
          if (tab) {
            // Create a new tab object with updated content
            const updatedTab = { ...tab, content: content };
            // Replace the old tab with the updated one
            const updatedDocs = workspace.docs.map((doc) =>
              doc.id === id ? updatedTab : doc,
            );
            // Create a new workspace object with updated docs
            const updatedWorkspace = { ...workspace, docs: updatedDocs };
            // Replace the old workspace with the updated one
            const updatedWorkspaces = {
              ...context.workspaces,
              [workspaceId]: updatedWorkspace,
            };
            return { ...context, workspaces: updatedWorkspaces };
          }
        }
        return context;
      }),
      saveState: (context) => saveState(context),
    },
  },
);

export const handleCreateTab = async (
  args: { title: string; content: string },
  workspaceId: string,
  filetype = 'markdown',
  autoSave = true,
  canEdit = true,
): Promise<ACDoc> => {
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
  content?: ACDoc[];
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
