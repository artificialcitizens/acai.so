import { createMachine, assign } from 'xstate';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db';
export type ACDoc = {
  id: string;
  workspaceId: string;
  title: string;
  filetype: 'md' | 'txt' | 'pdf';
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
  docIds: string[];
}

export interface AppContext {
  workspaces: { [key: string]: Workspace };
  docs: { [key: string]: ACDoc };
}

export const appDbService = {
  async saveWorkspace(workspace: Workspace, docs?: ACDoc[]) {
    try {
      await db.workspaces.put(workspace);
      if (docs) {
        docs.forEach((doc) => {
          db.docs.put(doc);
        });
      }
    } catch (error) {
      console.error('Error saving workspace:', error);
    }
  },

  async deleteWorkspace(workspaceId: string) {
    try {
      await db.workspaces.delete(workspaceId);
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
  },

  async saveDoc(doc: ACDoc) {
    try {
      await db.docs.put(doc);
    } catch (error) {
      console.error('Error saving doc:', error);
    }
  },

  async deleteDoc(docId: string) {
    try {
      await db.docs.delete(docId);
    } catch (error) {
      console.error('Error deleting doc:', error);
    }
  },

  async loadState(): Promise<AppContext> {
    const workspaces = await db.workspaces.toArray();
    const docs = await db.docs.toArray();
    const workspaceDictionary: { [key: string]: Workspace } = {};
    const tabDictionary: { [key: string]: ACDoc } = {}; // Add tabDictionary

    workspaces.forEach((workspace) => {
      workspaceDictionary[workspace.id] = { ...workspace, docIds: [] };
    });

    docs.forEach((doc) => {
      if (workspaceDictionary[doc.workspaceId]) {
        workspaceDictionary[doc.workspaceId].docIds.push(doc.id);
        tabDictionary[doc.id] = doc; // Add doc to tabDictionary
      }
    });

    return { workspaces: workspaceDictionary, docs: tabDictionary }; // Return tabs dictionary
  },
};

export type AppEvent =
  | { type: 'ADD_WORKSPACE'; workspace: Workspace; doc?: ACDoc }
  | { type: 'UPDATE_WORKSPACE'; id: string; workspace: Partial<Workspace> }
  | {
      type: 'REPLACE_WORKSPACE';
      id: string;
      workspace: Workspace;
      docs: ACDoc[];
    }
  | { type: 'DELETE_WORKSPACE'; workspaceId: string }
  | { type: 'ADD_DOC'; doc: ACDoc }
  | { type: 'DELETE_DOC'; id: string; workspaceId: string }
  | {
      type: 'UPDATE_DOC_CONTENT';
      id: string;
      content: any;
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
        actions: ['addWorkspace'],
      },
      UPDATE_WORKSPACE: {
        actions: ['updateWorkspace'],
      },
      REPLACE_WORKSPACE: {
        actions: ['replaceWorkspace'],
      },
      DELETE_WORKSPACE: {
        actions: ['deleteWorkspace'],
      },
      ADD_DOC: {
        actions: ['addDoc'],
      },
      DELETE_DOC: {
        actions: ['deleteDoc'],
      },
      UPDATE_DOC_CONTENT: {
        actions: ['updateDocContent'],
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
        const newDoc = event.doc;
        const updatedDocs = newDoc
          ? { ...context.docs, [newDoc.id]: newDoc }
          : context.docs;
        const newContext = {
          ...context,
          workspaces: {
            ...context.workspaces,
            [newWorkspace.id]: newWorkspace,
          },
          docs: updatedDocs,
        };
        appDbService.saveWorkspace(newWorkspace, newDoc ? [newDoc] : undefined);
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
        return { ...context, workspaces: updatedWorkspaces };
      }),
      replaceWorkspace: assign((context, event) => {
        if (event.type !== 'REPLACE_WORKSPACE') return context;
        const replacedWorkspace = event.workspace;
        const id = event.id;
        const docs = event.docs;
        const replacedWorkspaces = {
          ...context.workspaces,
          [id]: replacedWorkspace,
        };
        const replacedDocs = {
          ...context.docs,
          ...docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc }), {}),
        };
        appDbService.saveWorkspace(replacedWorkspaces[id], docs);
        docs.forEach((doc) => {
          appDbService.saveDoc(doc);
        });
        return {
          ...context,
          workspaces: replacedWorkspaces,
          docs: replacedDocs,
        };
      }),
      deleteWorkspace: assign((context, event) => {
        if (event.type !== 'DELETE_WORKSPACE') return context;
        const workspaceId = event.workspaceId;
        const newWorkspaces = { ...context.workspaces };
        const newDocs = { ...context.docs };

        // Get the workspace to be deleted
        const workspace = newWorkspaces[workspaceId];

        // Delete all tabs associated with the workspace
        if (workspace) {
          workspace.docIds.forEach((docId) => {
            delete newDocs[docId];
            appDbService.deleteDoc(docId);
          });
        }

        // Delete the workspace
        delete newWorkspaces[workspaceId];
        appDbService.deleteWorkspace(workspaceId);

        return { ...context, workspaces: newWorkspaces, docs: newDocs };
      }),
      addDoc: assign((context, event) => {
        if (event.type !== 'ADD_DOC') return context;
        const newDoc = event.doc;
        const workspace = context.workspaces[newDoc.workspaceId];
        if (workspace) {
          const updatedWorkspace = {
            ...workspace,
            docIds: [...workspace.docIds, newDoc.id],
          };
          const newWorkspaces = {
            ...context.workspaces,
            [newDoc.workspaceId]: updatedWorkspace,
          };
          const newDocs = {
            ...context.docs,
            [newDoc.id]: newDoc,
          };
          appDbService.saveDoc(newDoc);
          appDbService.saveWorkspace(newWorkspaces[newDoc.workspaceId]);
          return { ...context, workspaces: newWorkspaces, docs: newDocs };
        }
        return context;
      }),
      deleteDoc: assign((context, event) => {
        if (event.type !== 'DELETE_DOC') return context;
        const id = event.id;
        const workspaceId = event.workspaceId;
        const newDocs = { ...context.docs };
        delete newDocs[id];
        appDbService.deleteDoc(id);

        // Remove the doc id from the workspace's docIds array
        const workspace = context.workspaces[workspaceId];
        if (workspace) {
          const updatedWorkspace = {
            ...workspace,
            docIds: workspace.docIds.filter((docId) => docId !== id),
          };
          const newWorkspaces = {
            ...context.workspaces,
            [workspaceId]: updatedWorkspace,
          };
          appDbService.saveWorkspace(updatedWorkspace);
          return { ...context, workspaces: newWorkspaces, docs: newDocs };
        }

        return { ...context, docs: newDocs };
      }),
      updateDocContent: assign((context, event) => {
        if (event.type !== 'UPDATE_DOC_CONTENT') return context;
        const { id, content } = event;
        const updatedDoc = { ...context.docs[id], content };
        appDbService.saveDoc(updatedDoc);
        return { ...context, docs: { ...context.docs, [id]: updatedDoc } };
      }),
    },
  },
);

export const handleCreateDoc = async (
  args: { title: string; content: string },
  workspaceId: string,
  filetype = 'md' as 'md' | 'txt' | 'pdf',
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
  docs,
}: {
  workspaceName: string;
  id?: string;
  docs?: ACDoc[];
}): {
  workspace: Workspace;
  docs: ACDoc[];
} => {
  const newId = id || uuidv4();
  const newWorkspace: Workspace = {
    id: newId,
    name: workspaceName,
    createdAt: new Date().toString(),
    lastUpdated: new Date().toString(),
    private: false,
    docIds: [],
  };

  if (docs) {
    docs.forEach((doc) => {
      newWorkspace.docIds.push(doc.id);
    });
  }

  return {
    workspace: newWorkspace,
    docs: docs || [],
  };
};
