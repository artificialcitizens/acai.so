import { createMachine, assign } from 'xstate';

export const VoiceState = ['idle', 'ava', 'notes', 'voice'] as const;
export type VoiceState = (typeof VoiceState)[number];

export const TTSState = ['bark', 'elevenlabs', 'webSpeech'] as const;
export type TTSState = (typeof TTSState)[number];

export interface SpeechContext {
  micRecording: boolean;
  singleCommand: boolean;
  userTranscript: string;
  voiceState: VoiceState;
  ttsMode: TTSState;
}

export type SpeechEvent =
  | { type: 'TOGGLE_MIC_RECORDING' }
  | { type: 'TOGGLE_SINGLE_COMMAND' }
  | { type: 'SET_USER_TRANSCRIPT'; userTranscript: string }
  | { type: 'SET_VOICE_STATE'; voiceState: VoiceState }
  | { type: 'SET_TTS_MODE'; ttsMode: TTSState };

/**
 * Save state to local storage
 */
const saveSpeechState = (state: SpeechContext): Promise<void> => {
  return new Promise((resolve) => {
    localStorage.setItem('speechState', JSON.stringify(state));
    resolve();
  });
};
/**
 * Load state from local storage
 */
const loadSpeechState = (): SpeechContext => {
  const savedState = localStorage.getItem('speechState');
  return savedState
    ? JSON.parse(savedState)
    : {
        micRecording: false,
        singleCommand: false,
        userTranscript: '',
        voiceState: 'idle',
        ttsMode: 'webSpeech',
      };
};

// Define the initial context
const initialContext: SpeechContext = loadSpeechState();

export const speechMachine = createMachine<SpeechContext, SpeechEvent>({
  id: 'speech',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {},
    saving: {
      invoke: {
        id: 'saveState',
        src: (context: SpeechContext) => saveSpeechState(context),
        onDone: {
          target: 'idle',
        },
      },
    },
  },
  on: {
    TOGGLE_MIC_RECORDING: {
      target: 'saving',
      actions: assign((context) => {
        return { ...context, micRecording: !context.micRecording };
      }),
    },
    TOGGLE_SINGLE_COMMAND: {
      target: 'saving',
      actions: assign((context) => {
        return {
          ...context,
          singleCommand: !context.singleCommand,
          micRecording: false,
        };
      }),
    },
    SET_USER_TRANSCRIPT: {
      actions: assign((context, event) => {
        return { ...context, userTranscript: event.userTranscript };
      }),
    },
    SET_VOICE_STATE: {
      actions: assign((context, event) => {
        return { ...context, voiceState: event.voiceState };
      }),
    },
    SET_TTS_MODE: {
      actions: assign((context, event) => {
        return { ...context, ttsMode: event.ttsMode };
      }),
    },
  },
});
