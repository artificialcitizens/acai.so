import './App.css';
import React, { useState } from 'react';
import Whisper from './components/Whisper';
import TipTap from './components/TipTap/TipTap';
import Chat from './components/Chat/Chat';
import ElevenLabs from './components/Elevenlabs/ElevenLabs';
import SpeechRecognition from './components/SpeechRecognition/SpeechRecognition';
import { recognitionRouter } from './components/Whisper/recognition-manager';

export type State = 'strahl' | 'chat';

function App() {
  const [transcript, setTranscript] = useState<string>('');
  const [voice2voice, setVoice2voice] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<string>('chat');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  return (
    <>
      <Whisper
        onRecordingComplete={(blob) => console.log(blob)}
        onTranscriptionComplete={async (t) => {
          console.log('Whisper Server Response', t);
        }}
      />
      <ElevenLabs text={transcript} voice="strahl" />
      <Chat startingValue={transcript} onSubmitHandler={async (message) => `hello ${message}`} />
      <TipTap label="test" onClickHandler={async () => 'hello world'} />
      <SpeechRecognition
        onTranscriptionComplete={async (t) => {
          console.log('speech', t);
          const response = await recognitionRouter({ state: currentState, transcript: t });
          console.log(response);
          // if (!response || !response.ok) {
          //   throw new Error('Network response was not ok');
          // }
          // const result = await response.json();
          // const resp = result.response;
          // setTranscript(resp);
          // console.log(resp);
        }}
      />
    </>
  );
}

export default App;
