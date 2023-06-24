/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import './App.css';
import React, { useState, useEffect, useContext } from 'react';
import Whisper from './components/Whisper';
import Chat from './components/Chat/Chat';
import ElevenLabs from './components/Elevenlabs/ElevenLabs';
import SpeechRecognition from './components/SpeechRecognition/SpeechRecognition';
import { recognitionRouter } from './components/SpeechRecognition/recognition-manager';
import { avaChat } from './components/Chat/chat-routes';
import ChromeNotification from './utils/ChromeNotification';
import ToastManager from './components/Toast';
import { toast } from 'react-toastify';
import TodoList from './components/Todo';
export type State = 'strahl' | 'chat' | 'ava';
// new ChromeNotification('Incoming message', {
//   body: 'You have a new message from John Doe.',
//   requireInteraction: true,
// });
import SocketContext from './SocketContext';
import AudioWaveform from './components/AudioWave/AudioWave';
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    function success(position) {
      console.log('latitude', position.coords.latitude, 'longitude', position.coords.longitude);
    },
    function error(error_message) {
      console.log('An error has occured while retrieving location', error_message);
    },
  );
} else {
  console.log('geolocation is not enabled on this browser');
}

function App() {
  const [transcript, setTranscript] = useState<string>('');
  const [voice2voice, setVoice2voice] = useState<boolean>(false);
  const [speechRecognition, setSpeechRecognition] = useState<boolean>(true);
  const [currentState, setCurrentState] = useState<string>('ava');
  const [avaListening, setAvaListening] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const socket = useContext(SocketContext);

  const activateAudioContext = () => {
    const newAudioContext = new AudioContext();
    setAudioContext(newAudioContext);
  };
  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => {
      console.log(`Connected: ${socket.id}`);
    });

    socket.on('message', (message: string) => {
      console.log(message);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`);
    });

    // Clean up on unmount
    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('disconnect');
    };
  }, [socket]);

  const handleWindowClick = () => {
    if (!audioContext) {
      activateAudioContext();
    }
  };
  // Example usage:
  return (
    <div className="w-[99vw] h-[99vh] p-2" onClick={handleWindowClick}>
      <ToastManager />
      <AudioWaveform isOn={avaListening} audioContext={audioContext} />
      {/* <TodoList /> */}
      <Chat startingValue={transcript} name="Ava" avatar=".." onSubmitHandler={async (message) => avaChat(message)} />
      {/* <TipTap label="test" onClickHandler={async () => 'hello world'} /> */}
      <ElevenLabs text={transcript} voice="ava" />
      <div className="flex items-center justify-start">
        <Whisper
          onRecordingComplete={(blob) => console.log(blob)}
          onTranscriptionComplete={async (t) => {
            console.log('Whisper Server Response', t);
          }}
        />
        <SpeechRecognition
          active={speechRecognition}
          onClick={() => {
            setSpeechRecognition(!speechRecognition);
          }}
          onTranscriptionComplete={async (t) => {
            console.log('speech', t);
            if (!t) return;
            if (t === 'Ava' || (t === 'ava' && !avaListening)) {
              setAvaListening(true);
            } else if (t.toLowerCase() === 'cancel' && avaListening) {
              setAvaListening(false);
              return;
            }
            if (!avaListening) return;
            const response = await recognitionRouter({ state: currentState, transcript: t });
            console.log(response);
            setTranscript(response as string);
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
    </div>
  );
}

export default App;
