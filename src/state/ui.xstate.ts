import { createMachine, assign } from 'xstate';

interface IContext {
  thoughtsOpen: boolean;
  sideNavOpen: boolean;
  agentChatOpen: boolean;
}

/**
 * Save state to local storage
 */
const saveUIState = (state: IContext) => {
  localStorage.setItem('uiState', JSON.stringify(state));
};

/**
 * Load state from local storage
 */
const loadUIState = (): IContext => {
  const savedState = localStorage.getItem('uiState');
  return savedState ? JSON.parse(savedState) : { thoughtsOpen: false, sideNavOpen: false, agentChatOpen: false };
};

// Define the initial context
const initialContext: IContext = loadUIState();

// Define the machine
export const uiMachine = createMachine<IContext>({
  id: 'ui',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {},
  },
  on: {
    TOGGLE_AGENT_THOUGHTS: {
      actions: assign({
        thoughtsOpen: (context) => {
          const updatedState = !context.thoughtsOpen;
          saveUIState({ ...context, thoughtsOpen: updatedState });
          return updatedState;
        },
      }),
    },
    TOGGLE_SIDE_NAV: {
      actions: assign({
        sideNavOpen: (context) => {
          const updatedState = !context.sideNavOpen;
          saveUIState({ ...context, sideNavOpen: updatedState });
          return updatedState;
        },
      }),
    },
    TOGGLE_AGENT_CHAT: {
      actions: assign({
        agentChatOpen: (context) => {
          const updatedState = !context.agentChatOpen;
          saveUIState({ ...context, agentChatOpen: updatedState });
          return updatedState;
        },
      }),
    },
  },
});
