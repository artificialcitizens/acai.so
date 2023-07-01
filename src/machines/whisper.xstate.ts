import { createMachine } from 'xstate';

export const whisperStateMachine = createMachine({
  id: 'whisper',
  initial: 'idle',
  states: {
    idle: {
      on: { START_RECORDING: 'recording' },
    },
    recording: {
      on: { STOP_RECORDING: 'processing' },
    },
    processing: {
      on: { RECORDING_PROCESSED: 'idle' },
    },
  },
});
