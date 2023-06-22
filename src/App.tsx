import './App.css';
import MicRecorder from './components/MicRecorder/MicRecorder';
import TipTap from './components/TipTap/TipTap';
import Chat from './components/Chat/Chat';
import ElevenLabs from './components/MicRecorder/ElevenLabs';
import React, { useState } from 'react';
import { recognitionRouter } from './components/MicRecorder/recognition-manager';

function App() {
  const [transcript, setTranscript] = useState<string>('');
  // const response = await recognitionRouter({ state: 'chris', transcript });
  // if (!response.ok) {
  //   throw new Error('Network response was not ok');
  // }
  // // console.log(response.body);
  // // response.body?.pipeTo(new WritableStream());
  // const result = await response.text();
  // console.log(result);
  // If the transcript includes the activation word, start recording
  const voice2voice = false;
  return (
    <>
      <MicRecorder
        onRecordingComplete={(blob) => console.log(blob)}
        onTranscriptionComplete={async (transcript) => {
          if (voice2voice) {
            setTranscript(transcript);
            return;
          }
          const response = await recognitionRouter({ state: 'chris', transcript });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          // console.log(response.body);
          // response.body?.pipeTo(new WritableStream());
          const result = await response.json();
          const resp = result.response;
          setTranscript(resp);
          console.log(resp);
        }}
      />
      {transcript && <ElevenLabs text={transcript} />}
      <Chat onSubmitHandler={async (message) => `hello ${message}`} />
      {/* <TipTap label="test" onClickHandler={async () => 'hello world'} /> */}
    </>
  );
}

export default App;
