import { createMachine, assign, actions } from 'xstate';
import React from 'react';

interface IContext {
  micRecording: boolean;
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
  return savedState ? JSON.parse(savedState) : { micRecording: false };
};

// Define the initial context
const initialContext: IContext = loadUIState();

const { pure } = actions;

export const speechMachine = createMachine<IContext>({
  id: 'speech',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {},
  },
  on: {
    TOGGLE_MIC_RECORDING: {
      actions: pure((context) => {
        const updatedState = !context.micRecording;
        return [
          assign({ micRecording: updatedState }),
          actions.assign((ctx) => {
            // saveUIState({ ...ctx, micRecording: updatedState });
            return ctx;
          }),
        ];
      }),
    },
  },
});

loadUIState();
