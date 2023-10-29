import { createMachine, assign } from 'xstate';
import React from 'react';

export interface UIContext {
  thoughtsOpen: boolean;
  sideNavOpen: boolean;
  agentChatOpen: boolean;
  modalOpen: boolean;
  modalContent: string | React.ReactNode;
}

// @TODO: update to use db service paradigm
const saveUIState = (context: UIContext) => {
  const stateCopy = { ...context };
  stateCopy.modalContent = '';
  stateCopy.modalOpen = false;
  localStorage.setItem('uiState', JSON.stringify(stateCopy));
};

const loadUIState = (): UIContext => {
  const savedState = localStorage.getItem('uiState');
  return savedState
    ? JSON.parse(savedState)
    : {
        thoughtsOpen: true,
        sideNavOpen: false,
        agentChatOpen: true,
        modalOpen: false,
        modalContent: '',
      };
};

const initialContext: UIContext = loadUIState();

export type AC_UIEvent =
  | { type: 'TOGGLE_AGENT_THOUGHTS' }
  | { type: 'TOGGLE_SIDE_NAV' }
  | { type: 'TOGGLE_AGENT_CHAT' }
  | {
      type: 'TOGGLE_MODAL';
      modalContent?: string | React.ReactNode;
    };

export const uiMachine = createMachine<UIContext, AC_UIEvent>(
  {
    predictableActionArguments: true,
    id: 'ui',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {},
    },
    on: {
      TOGGLE_AGENT_THOUGHTS: {
        actions: ['toggleThoughtsOpen', 'saveUIState'],
      },
      TOGGLE_SIDE_NAV: {
        actions: ['toggleSideNavOpen', 'saveUIState'],
      },
      TOGGLE_AGENT_CHAT: {
        actions: ['toggleAgentChatOpen', 'saveUIState'],
      },
      TOGGLE_MODAL: {
        actions: ['toggleModal', 'saveUIState'],
      },
    },
  },
  {
    actions: {
      toggleThoughtsOpen: assign((context) => {
        return { ...context, thoughtsOpen: !context.thoughtsOpen };
      }),
      toggleSideNavOpen: assign((context) => {
        return { ...context, sideNavOpen: !context.sideNavOpen };
      }),
      toggleAgentChatOpen: assign((context) => {
        return { ...context, agentChatOpen: !context.agentChatOpen };
      }),
      toggleModal: assign((context, event) => {
        if (event.type === 'TOGGLE_MODAL') {
          const { modalContent } = event;
          return {
            ...context,
            modalOpen: !context.modalOpen,
            modalContent,
          };
        }
        return context;
      }),
      saveUIState: (context) => saveUIState(context),
    },
  },
);
