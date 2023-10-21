import { createMachine, assign, actions } from 'xstate';

interface IContext {
  micRecording: boolean;
}

/**
 * Save state to local storage
 */
const saveSpeechState = (state: IContext) => {
  localStorage.setItem('speechState', JSON.stringify(state));
};

/**
 * Load state from local storage
 */
const loadSpeechState = (): IContext => {
  const savedState = localStorage.getItem('speechState');
  return savedState ? JSON.parse(savedState) : { micRecording: false };
};

// Define the initial context
const initialContext: IContext = loadSpeechState();

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
            return ctx;
          }),
        ];
      }),
    },
  },
});

loadSpeechState();
