import './App.css';
import MicRecorder from './components/MicRecorder/MicRecorder';
import TipTap from './components/TipTap/TipTap';
import Chat from './components/Chat/Chat';
import ElevenLabs from './components/MicRecorder/ElevenLabs';
import React, { useState } from 'react';
import { recognitionRouter } from './components/MicRecorder/recognition-manager';

function App() {
  const [transcript, setTranscript] = useState<string>('');
  const [voice2voice, setVoice2voice] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<string>('chat');

  return (
    <>
      <MicRecorder
        onRecordingComplete={(blob) => console.log(blob)}
        onTranscriptionComplete={async (transcript) => {
          if (voice2voice) {
            setTranscript(transcript);
            return;
          }
          const response = await recognitionRouter({ state: currentState, transcript });
          if (!response || !response.ok) {
            throw new Error('Network response was not ok');
          }
          const result = await response.json();
          const resp = result.response;
          setTranscript(resp);
          console.log(resp);
        }}
      />
      <ElevenLabs text={transcript} voice="strahl" />
      <Chat startingValue={transcript} onSubmitHandler={async (message) => `hello ${message}`} />
      <TipTap label="test" onClickHandler={async () => 'hello world'} />
    </>
  );
}

export default App;
