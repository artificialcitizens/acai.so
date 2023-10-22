import { createMachine, assign } from 'xstate';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db';
import { toastifyInfo } from '../components/Toast';
import isEqual from 'lodash/isEqual';
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

export const appDbService = {
  async saveWorkspace(workspace: Workspace) {
    try {
      console.log('Saving or updating workspace', workspace);
      await db.workspaces.put(workspace);
    } catch (error) {
      console.error('Error saving workspace:', error);
    }
  },

  async deleteWorkspace(workspaceId: string) {
    try {
      console.log('Deleting workspace', workspaceId);
      await db.workspaces.delete(workspaceId);
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  },

  async saveDoc(doc: ACDoc) {
    try {
      console.log('Saving or updating doc', doc);
      await db.docs.put(doc);
    } catch (error) {
      console.error('Error saving doc:', error);
    }
  },

  async deleteDoc(docId: string) {
    try {
      console.log('Deleting doc', docId);
      await db.docs.delete(docId);
    } catch (error) {
      console.error('Error deleting doc:', error);
    }
  },

  async loadState(): Promise<AppContext> {
    const workspaces = await db.workspaces.toArray();
    const docs = await db.docs.toArray();
    const workspaceDictionary: WorkspaceDictionary = {};

    workspaces.forEach((workspace) => {
      workspaceDictionary[workspace.id] = { ...workspace, docs: [] };
    });

    docs.forEach((doc) => {
      if (workspaceDictionary[doc.workspaceId]) {
        workspaceDictionary[doc.workspaceId].docs = [
          ...workspaceDictionary[doc.workspaceId].docs,
          doc,
        ];
      }
    });

    return { workspaces: workspaceDictionary };
  },
};

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
      workspace: Workspace;
    }
  | { type: 'INITIALIZE'; state: AppContext };

export const appStateMachine = createMachine<AppContext, AppEvent>(
  {
    predictableActionArguments: true,
    id: 'appState',
    initial: 'idle',
    context: undefined,
    states: {
      loading: {
        invoke: {
          id: 'loadInitialState',
          src: () => appDbService.loadState(),
          onDone: {
            target: 'idle',
            actions: assign((context, event) => {
              console.log('Loaaaaded state', event.data);
              return event.data;
            }),
          },
          onError: {
            target: 'error',
            actions: (context, event) => {
              console.error('Error loading state:', event.data);
            },
          },
        },
      },
      idle: {},
      error: {},
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
      INITIALIZE: {
        actions: assign((context, event) => event.state),
      },
    },
  },
  {
    actions: {
      addWorkspace: assign((context, event) => {
        if (event.type !== 'ADD_WORKSPACE') return context;
        const newWorkspace = event.workspace;
        const newContext = {
          ...context,
          workspaces: {
            ...context.workspaces,
            [newWorkspace.id]: newWorkspace,
          },
        };
        appDbService.saveWorkspace(newWorkspace);
        newWorkspace.docs.forEach((doc) => appDbService.saveDoc(doc)); // Save each document
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
        appDbService.saveWorkspace(updatedWorkspaces[id]);
        updatedWorkspaces[id].docs.forEach((doc) => appDbService.saveDoc(doc)); // Update each document
        return { ...context, workspaces: updatedWorkspaces };
      }),
      replaceWorkspace: assign((context, event) => {
        if (event.type !== 'REPLACE_WORKSPACE') return context;
        const replacedWorkspace = event.workspace;
        const id = event.id;
        const replacedWorkspaces = {
          ...context.workspaces,
          [id]: replacedWorkspace,
        };
        appDbService.saveWorkspace(replacedWorkspaces[id]);
        replacedWorkspaces[id].docs.forEach((doc) => appDbService.saveDoc(doc)); // Replace each document
        return { ...context, workspaces: replacedWorkspaces };
      }),
      deleteWorkspace: assign((context, event) => {
        if (event.type !== 'DELETE_WORKSPACE') return context;
        const workspaceId = event.workspaceId;
        const newWorkspaces = { ...context.workspaces };
        if (newWorkspaces[workspaceId]) {
          newWorkspaces[workspaceId].docs.forEach((doc) => {
            appDbService.deleteDoc(doc.id);
          });
        }
        delete newWorkspaces[workspaceId];
        appDbService.deleteWorkspace(workspaceId);
        return { ...context, workspaces: newWorkspaces };
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
          appDbService.saveDoc(newTab);
          appDbService.saveWorkspace(newWorkspace); // Save the updated workspace
          return { ...context, workspaces: newWorkspaces };
        }
        return context;
      }),
      deleteTab: assign((context, event) => {
        if (event.type !== 'DELETE_TAB') return context;
        const id = event.id;
        Object.values(context.workspaces).forEach((workspace) => {
          const originalLength = workspace.docs.length;
          workspace.docs = workspace.docs.filter((tab) => tab.id !== id);
          if (workspace.docs.length !== originalLength) {
            appDbService.saveWorkspace(workspace); // Save the updated workspace
          }
        });
        appDbService.deleteDoc(id);
        return { ...context };
      }),
      updateTabContent: assign((context, event) => {
        if (event.type !== 'UPDATE_TAB_CONTENT') return context;
        const { id, content, workspace } = event;
        if (workspace) {
          const updatedWorkspace = {
            ...workspace,
            docs: workspace.docs.map((doc) =>
              doc.id === event.id ? { ...doc, content } : doc,
            ),
          };
          const updatedDoc = updatedWorkspace.docs.find((doc) => doc.id === id);
          if (updatedDoc) {
            appDbService.saveDoc(updatedDoc);
          }
          appDbService.saveWorkspace(updatedWorkspace); // Save the updated workspace
          return {
            ...context,
            workspaces: {
              ...context.workspaces,
              [workspace.id]: updatedWorkspace,
            },
          };
        }
        return context;
      }),
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
