import { createMachine, assign } from 'xstate';
import { timestampToHumanReadable } from '../utils/data-utils';
import { v4 as uuidv4 } from 'uuid';

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
  | { type: 'UPDATE_NOTES'; id: string; notes: string }
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
                id: 'welcome',
                title: 'acai.so - The AI Supertool',
                filetype: 'markdown',
                content: `# Welcome
                
                Welcome to acai.so, the AI supertool.        
                acai.so is a collection of NLU, NLP, and AI tools that work together to accelerate your learning, productivity, and creativity.

                With acai.so, you can create individual workspaces to organize your thoughts, ideas, and projects. Each workspace has it's own instance of document editor, chat interface, and an automated virtual assistant (AVA) that can help you create, edit, and organize your documents, as well as answer questions, summarize, and more.

                ⚠️ Please note: This is an early alpha preview build and is not yet ready for production use. Things can and will break.
                Please report any bugs or issues to link to our [Github issues](https://github.com/artificialcitizens/acai.so/issues).
                Thanks for helping make acai.so better for everyone!
                `,
                isContext: false,
                systemNote: '',
                workspaceId: 'docs',
                createdAt: timestampToHumanReadable(),
                lastUpdated: timestampToHumanReadable(),
              },
              {
                id: 'getting-started',
                title: 'Getting Started',
                filetype: 'markdown',
                content: `# Getting Started
                
                acai.so consists of two main modules:

                - AVA
                - Document Editor

                ## AVA
                
                AVA is your automated virtual assistant. By using a decoupled system and event driven actions, AVA has knowledge of all the data in acai.so, as well as the ability to interact with the UI to create documents, activate tabs, and much more.
                
                ### Submodules

                Ava has several submodules that combine to create a powerful agentic system. These submodules are:
                - Knowledge (WIP) - this allows the user to upload documents for AVA to reference while answering questions or creating content.
                - Voice Synthesis - this allows for verbal communication with AVA and leverages various text-to-speech and speech-to-text APIs to synthesize and understand speech.
                - Chat - this allows for text-based communication with AVA and leverages various NLU and NLP APIs to understand and respond to text. This is the main interface for interacting with AVA.

                ## Document Editor

                ⚠️ This is still a work in progress and a lot of the functionality is currently in development.

                The document editor is a powerful tool for creating, editing, and organizing documents. It is built on top of the [tiptap](https://www.tiptap.dev/) editor and is an AI powered open source alternative to Notion, Roam, and other document editors.
                By giving Ava access to the document editor, you can use AVA to create and edit documents, as well as answer questions about the document, summarize, and more.
                
                `,
                isContext: false,
                systemNote: '',
                workspaceId: 'docs',
                createdAt: timestampToHumanReadable(),
                lastUpdated: timestampToHumanReadable(),
              },
              {
                id: 'ava',
                title: 'AVA, your automated virtual assistant',
                filetype: 'markdown',
                content: `# AVA - Your Automated Virtual Assistant

                AVA is an automated virtual assistant that can help you create, edit, and organize your documents, as well as answer questions, summarize, and more.

                ⚠️ Please note: This is an early alpha preview build and is not yet ready for production use. Things can and will break.
                Please report any bugs or issues to link to our [Github issues](https://github.com/artificialcitizens/acai.so/issues).
                Thanks for helping make acai.so better for everyone!
                `,
                isContext: false,
                systemNote: '',
                workspaceId: 'docs',
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

        DELETE_WORKSPACE: {
          actions: [
            assign((context, event) => {
              const workspaceId = event.workspaceId;
              const tabId = event.id;
              const workspace = context.workspaces[workspaceId];
              if (workspace) {
                // Remove the tab from the tabs array
                workspace.data.tiptap.tabs = workspace.data.tiptap.tabs.filter(
                  (tab) => tab.id !== tabId,
                );
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
                  [workspaceId]: newWorkspace,
                };
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
            (context, event) => saveState(context),
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

        UPDATE_NOTES: {
          actions: [
            assign((context, event) => {
              const { id, notes } = event;
              const workspace = context.workspaces[id];
              if (workspace) {
                workspace.data.notes = notes;
              }
              return { ...context };
            }),
            (context, event) => saveState(context),
          ],
        },

        TOGGLE_CONTEXT: {
          actions: [
            assign((context, event) => {
              const { id, workspaceId } = event;
              const workspace = context.workspaces[workspaceId];
              if (workspace) {
                const tab = workspace.data.tiptap.tabs.find(
                  (tab) => tab.id === id,
                );
                if (tab) {
                  tab.isContext = !tab.isContext;
                }
              }
              return context;
            }),
            (context, event) => saveState(context),
          ],
        },

        UPDATE_TAB_SYSTEM_NOTE: {
          actions: [
            assign((context, event) => {
              const { id, systemNote, workspaceId } = event;
              const workspace = context.workspaces[workspaceId];
              if (workspace) {
                const tab = workspace.data.tiptap.tabs.find(
                  (tab) => tab.id === id,
                );
                if (tab) {
                  tab.systemNote = systemNote;
                }
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
): Promise<Tab> => {
  const newTab = {
    id: uuidv4().split('-')[0],
    title: args.title,
    content: args.content,
    isContext: false,
    systemNote: '',
    workspaceId,
    filetype,
    createdAt: new Date().toString(),
    lastUpdated: new Date().toString(),
  };
  return newTab;
};
