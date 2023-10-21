import { createMachine, assign, actions } from 'xstate';

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
const saveSpeechState = (state: SpeechContext) => {
  localStorage.setItem('speechState', JSON.stringify(state));
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

const { pure } = actions;

export const speechMachine = createMachine<SpeechContext, SpeechEvent>({
  predictableActionArguments: true,
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
    TOGGLE_SINGLE_COMMAND: {
      actions: pure((context) => {
        const updatedState = !context.singleCommand;
        return [
          assign({ singleCommand: updatedState }),
          actions.assign((ctx) => {
            ctx.micRecording = false;
            saveSpeechState({
              ...ctx,
              singleCommand: updatedState,
            });
            return ctx;
          }),
        ];
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

loadSpeechState();
