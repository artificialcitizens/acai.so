import './App.css';
import React, { useState } from 'react';
import Whisper from './components/Whisper';
import TipTap from './components/TipTap/TipTap';
import Chat from './components/Chat/Chat';
import ElevenLabs from './components/Elevenlabs/ElevenLabs';
import SpeechRecognition from './components/SpeechRecognition/SpeechRecognition';
import { recognitionRouter } from './components/SpeechRecognition/recognition-manager';
import { hermesChat } from './components/Chat/chat-routes';

export type State = 'strahl' | 'chat';

function App() {
  const [transcript, setTranscript] = useState<string>('');
  const [voice2voice, setVoice2voice] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<string>('chat');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  return (
    <>
      <Chat startingValue={transcript} onSubmitHandler={async (message) => hermesChat(message)} />
      {/* <TipTap label="test" onClickHandler={async () => 'hello world'} /> */}
      <ElevenLabs text={transcript} voice="strahl" />
      <div className="flex items-center justify-start">
        <Whisper
          onRecordingComplete={(blob) => console.log(blob)}
          onTranscriptionComplete={async (t) => {
            console.log('Whisper Server Response', t);
          }}
        />
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
      </div>
    </>
  );
}

export default App;
