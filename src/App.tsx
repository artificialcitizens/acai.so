/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useContext } from 'react';
import Whisper from './components/Whisper';
import Chat from './components/Chat/Chat';
import ElevenLabs from './components/Elevenlabs/ElevenLabs';
import SpeechRecognition from './components/SpeechRecognition/SpeechRecognition';
import { recognitionRouter } from './components/SpeechRecognition/recognition-manager';
import { avaChat } from './components/Chat/chat-routes';
import ChromeNotification from './utils/ChromeNotification';
import ToastManager, { toastifyAgentThought, toastifyDefault, toastifyInfo } from './components/Toast';
import { toast } from 'react-toastify';
import SocketContext from './context/SocketContext';
import AudioWaveform from './components/AudioWave/AudioWave';
import Sidebar from './components/Sidebar';
import TipTap from './components/TipTap/TipTap';
import SBSidebar from './components/Sidebar';
import { MainContainer } from '@chatscope/chat-ui-kit-react';
import { Header } from './components/Header/Header';
import TabManager from './components/Tabs';
import StorageMeter from './components/StorageMeter/StorageMeter';

export type State = 'ava' | 'notes';

// const getGeolocation = () => {
//   if ('geolocation' in navigator) {
//     navigator.geolocation.getCurrentPosition(
//       function success(position) {
//         console.log('latitude', position.coords.latitude, 'longitude', position.coords.longitude);
//       },
//       function error(error_message) {
//         console.log('An error has occured while retrieving location', error_message);
//       },
//     );
//   } else {
//     console.log('geolocation is not enabled on this browser');
//   }
// };
function App() {
  const [transcript, setTranscript] = useState<string>('');
  // const [voice2voice, setVoice2voice] = useState<boolean>(false);
  const [speechRecognition, setSpeechRecognition] = useState<boolean>(true);
  const [currentState, setCurrentState] = useState<string>('ava');
  const [avaListening, setAvaListening] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [userLocation, setUserLocation] = useState<string>('Portland, OR');

  // useEffect(() => {
  //   getGeolocation();
  // }, []);

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

    // HERE IS HOW TO USE TOOLS VIA SOCKET BY HAVING THE TOOL SEND THE ACTION THROUGH SOCKET
    // socket.on('agent-action', (action: string) => {
    //   console.log('agent-action', action);
    //   if (action === 'start-listening') {
    //     setAvaListening(true);
    //   } else if (action === 'stop-listening') {
    //     setAvaListening(false);
    //   }
    // });

    socket.on('agent-action', (action: { log: string; action: string; tool: string; toolName: string }) => {
      console.log('agent-action', action);
      const thought = action.log.split('Action:')[0].trim();
      toastifyAgentThought(thought);
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
    <div onClick={handleWindowClick}>
      <AudioWaveform isOn={avaListening} audioContext={audioContext} />
      <ToastManager />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="w-full flex-grow max-h-screen p-3">
          <TabManager />
          <SBSidebar>
            <div>
              <SpeechRecognition
                active={speechRecognition}
                onClick={() => {
                  setSpeechRecognition(!speechRecognition);
                }}
                onTranscriptionComplete={async (t) => {
                  console.log('speech', t);
                  if (!t) return;
                  if ((t === 'Ava' || t === 'ava') && !avaListening) {
                    setAvaListening(true);
                  } else if (t.toLowerCase() === 'cancel' && avaListening) {
                    setAvaListening(false);
                    return;
                  }

                  if (!avaListening) return;

                  if (t.toLowerCase() === 'take notes' && avaListening) {
                    setCurrentState('notes');
                    toastifyInfo('Taking notes');
                  }
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
              <ElevenLabs text={transcript} voice="ava" />
              {/* <Whisper
                onRecordingComplete={(blob) => console.log(blob)}
                onTranscriptionComplete={async (t) => {
                  console.log('Whisper Server Response', t);
                }}
              /> */}
              <StorageMeter />
            </div>
          </SBSidebar>
        </main>
      </div>
    </div>
    // <div className="w-[99vw] h-[99vh] p-2" onClick={handleWindowClick}>
    //   <AudioWaveform isOn={avaListening} audioContext={audioContext} />
    //   {/* <TodoList /> */}
    //   <div className="flex items-center justify-start">
    //   <ElevenLabs text={transcript} voice="ava" />
    //     <Whisper
    //       onRecordingComplete={(blob) => console.log(blob)}
    //       onTranscriptionComplete={async (t) => {
    //         console.log('Whisper Server Response', t);
    //       }}
    //     />
    //     <SpeechRecognition
    //       active={speechRecognition}
    //       onClick={() => {
    //         setSpeechRecognition(!speechRecognition);
    //       }}
    //       onTranscriptionComplete={async (t) => {
    //         console.log('speech', t);
    //         if (!t) return;
    //         if (t === 'Ava' || (t === 'ava' && !avaListening)) {
    //           setAvaListening(true);
    //         } else if (t.toLowerCase() === 'cancel' && avaListening) {
    //           setAvaListening(false);
    //           return;
    //         }
    //         if (t.toLowerCase() === 'take notes' && avaListening) {
    //           setCurrentState('notes');
    //           toast('Taking notes');
    //         }
    //         if (!avaListening) return;
    //         // const response = await recognitionRouter({ state: currentState, transcript: t });
    //         // console.log(response);
    //         // setTranscript(response as string);
    //         // if (!response || !response.ok) {
    //         //   throw new Error('Network response was not ok');
    //         // }
    //         // const result = await response.json();
    //         // const resp = result.response;
    //         // setTranscript(resp);
    //         // console.log(resp);
    //       }}
    //     />
    //   </div>
    // </div>
  );
}

export default App;
