import { createMachine, assign, actions } from 'xstate';

interface IContext {
  thoughtsOpen: boolean;
  sideNavOpen: boolean;
  agentChatOpen: boolean;
  modalOpen: boolean;
  modalContent: string | React.ReactNode;
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
  return savedState
    ? JSON.parse(savedState)
    : { thoughtsOpen: true, sideNavOpen: false, agentChatOpen: true };
};

// Define the initial context
const initialContext: IContext = loadUIState();

const { pure } = actions;

export const uiMachine = createMachine<IContext>({
  id: 'ui',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {},
  },
  on: {
    TOGGLE_AGENT_THOUGHTS: {
      actions: pure((context) => {
        const updatedState = !context.thoughtsOpen;
        return [
          assign({ thoughtsOpen: updatedState }),
          actions.assign((ctx) => {
            saveUIState({ ...ctx, thoughtsOpen: updatedState });
            return ctx;
          }),
        ];
      }),
    },
    TOGGLE_SIDE_NAV: {
      actions: pure((context) => {
        const updatedState = !context.sideNavOpen;
        return [
          assign({ sideNavOpen: updatedState }),
          actions.assign((ctx) => {
            saveUIState({ ...ctx, sideNavOpen: updatedState });
            return ctx;
          }),
        ];
      }),
    },
    TOGGLE_AGENT_CHAT: {
      actions: pure((context) => {
        const updatedState = !context.agentChatOpen;
        return [
          assign({ agentChatOpen: updatedState }),
          actions.assign((ctx) => {
            saveUIState({ ...ctx, agentChatOpen: updatedState });
            return ctx;
          }),
        ];
      }),
    },
    TOGGLE_MODAL: {
      actions: pure((context, event) => {
        const updatedState = !context.modalOpen;
        const updatedContent = event.content || context.modalContent;
        return [
          assign({ modalOpen: updatedState, modalContent: updatedContent }),
          actions.assign((ctx) => {
            saveUIState({
              ...ctx,
              modalOpen: updatedState,
              modalContent: updatedContent,
            });
            return ctx;
          }),
        ];
      }),
    },
  },
});

loadUIState();
