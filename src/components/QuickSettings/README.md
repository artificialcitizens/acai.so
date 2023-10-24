# VoiceRecognition Component

The VoiceRecognition component is a part of the voice command system in our application. It uses various hooks and services to handle voice commands, transcriptions, and text-to-speech synthesis.

## Props

- onVoiceActivation: A function that is called when the voice recognition state changes. It receives a boolean indicating whether the voice recognition is active or not.
- audioContext: An optional AudioContext object for handling audio operations.

## Hooks

- useAva: This hook is used to query Ava, our AI assistant.
- useBark: This hook is used to synthesize speech using the Bark TTS engine.
- useElevenlabs: This hook is used to synthesize speech using the Elevenlabs TTS engine.
- useSpeechRecognition: This hook is used to transcribe speech to text.
- useVoiceCommands: This hook is used to handle voice commands.
- useWebSpeechSynthesis: This hook is used to synthesize speech using the Web Speech API.
- useBroadcastManager: This hook is used to manage broadcast events.
- useLocalStorageKeyValue: This hook is used to store and retrieve key-value pairs from local storage.

## Functions

- handleVoiceCommand: This function is used to handle voice commands. It checks the current voice recognition state and performs the appropriate action.
- synthesizeAndPlay: This function is used to synthesize speech and play the resulting audio. It supports the Bark, Elevenlabs, and Web Speech API TTS engines.
- onTranscriptionComplete: This function is called when a transcription is complete. It updates the user transcript and handles the voice command.

## State

- userTranscript: The transcript of the user's speech.
- voiceRecognitionState: The current state of the voice recognition system. It can be 'idle', 'ava', 'notes', or 'voice'.
- synthesisMode: The current TTS engine. It can be 'bark', 'elevenlabs', or 'webSpeech'.
- ttsLoading: A boolean indicating whether the TTS engine is currently synthesizing speech.
- singleCommandMode: A boolean indicating whether the system should process single commands or continuous speech.

## Usage

The VoiceRecognition component is used in the main application to handle voice commands and synthesize responses. It is a controlled component, meaning that its state is managed by its parent component. The parent component can control the voice recognition system by changing the voiceRecognitionState prop.

## Example

```
import VoiceRecognition from './VoiceRecognition';

function App() {
  const [voiceActive, setVoiceActive] = useState(false);

  return (
    <div>
      <VoiceRecognition onVoiceActivation={setVoiceActive} />
      {voiceActive && <p>Voice recognition is active</p>}
    </div>
  );
}
```

In this example, the App component uses the VoiceRecognition component to handle voice commands. It also displays a message when the voice recognition system is active.

## useVoiceCommands Hook Documentation

The useVoiceCommands hook is used to handle voice commands in our application. It uses various hooks and services to handle voice commands, transcriptions, and text-to-speech synthesis.

## State

- userTranscript: The transcript of the user's speech.
- voiceRecognitionState: The current state of the voice recognition system. It can be 'idle', 'ava', 'notes', or 'voice'.
- synthesisMode: The current TTS engine. It can be 'bark', 'elevenlabs', or 'webSpeech'.

## Functions

- setStatesAndToast: This function is used to update the user transcript and voice recognition state, and optionally display a toast message.
- createCommand: This function is used to create a command object. A command object includes an array of command strings, a recognition state, an optional toast message, and an optional action function.
- handleReadyCommand: This function is used to handle the 'ready' command. It creates a new note tab and navigates to it.
- handleVoiceCommand: This function is used to handle voice commands. It finds the command object that matches the given command string and executes its action function.

## Usage

The useVoiceCommands hook is used in the VoiceRecognition component to handle voice commands. It provides the state and functions needed to handle voice commands, transcriptions, and text-to-speech synthesis.

## Example

```
import { useVoiceCommands } from './use-voice-command';

function VoiceRecognition() {
  const {
    userTranscript,
    setUserTranscript,
    voiceRecognitionState,
    setVoiceRecognitionState,
    synthesisMode,
    setSynthesisMode,
    handleVoiceCommand,
  } = useVoiceCommands();

  // ... rest of the component
}
```
