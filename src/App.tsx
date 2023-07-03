/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useContext } from 'react';
import Whisper from './components/Whisper';
import ElevenLabs from './components/Elevenlabs/ElevenLabs';
import SpeechRecognition from './components/SpeechRecognition/SpeechRecognition';
import { recognitionRouter } from './components/SpeechRecognition/recognition-manager';
import ToastManager, { toastifyAgentObservation, toastifyAgentThought, toastifyInfo } from './components/Toast';
import SocketContext from './context/SocketContext';
import AudioWaveform from './components/AudioWave/AudioWave';
import SBSidebar from './components/Sidebar';
import { Header } from './components/Header/Header';
import TabManager from './components/Tabs';
import StorageMeter from './components/StorageMeter/StorageMeter';
import { ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import NotificationCenter from './components/NotificationCenter';
import Chat from './components/Chat/Chat';
import { avaChat } from './components/Chat/chat-routes';
import SBSearch from './components/Search';
import ScratchPad from './components/ScratchPad/ScratchPad';
import { useTabs } from './hooks/use-tabs';

export type State = 'idle' | 'passive' | 'ava' | 'notes';

// const [userLocation, setUserLocation] = useState<string>('Portland, OR');
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
  const [currentState, setCurrentState] = useState<string>('passive');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { tabs, activeTab, createTab, deleteTab, updateContent, setActiveTab } = useTabs();
  const [currentTool, setCurrentTool] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(true);
  const [agentThoughtsOpen, setAgentThoughtsOpen] = useState(true);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const toggleAgentThoughts = () => {
    setAgentThoughtsOpen(!agentThoughtsOpen);
  };
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

    const handleConnect = () => console.log(`Connected: ${socket.id}`);
    const handleMessage = (message: string) => console.log(message);
    const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);
    const handleCreateTab = async (args: { title: string; content: string }) => {
      const id = Date.now().toString();
      updateContent(id, {
        title: args.title,
        content: args.content,
      });
      const index = tabs.length;
      setActiveTab(index.toString());
    };
    const handleAgentAction = (action: { log: string; action: string; tool: string; toolName: string }) => {
      console.log('agent-action', action);
      const thought = action.log.split('Action:')[0].trim();
      toastifyAgentThought(thought);
    };

    socket.on('connect', handleConnect);
    socket.on('message', handleMessage);
    socket.on('disconnect', handleDisconnect);
    socket.on('create-tab', handleCreateTab);
    socket.on('agent-action', handleAgentAction);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessage);
      socket.off('disconnect', handleDisconnect);
      socket.off('create-tab', handleCreateTab);
      socket.off('agent-action', handleAgentAction);
    };
  }, [socket, createTab, tabs, updateContent, setActiveTab]); // specify the dependencies here

  // HERE IS HOW TO USE TOOLS VIA SOCKET BY HAVING THE TOOL SEND THE ACTION THROUGH SOCKET
  // socket.on('agent-action', (action: string) => {
  //   console.log('agent-action', action);
  //   if (action === 'start-listening') {
  //     setAvaListening(true);
  //   } else if (action === 'stop-listening') {
  //     setAvaListening(false);
  //   }
  // });

  const handleWindowClick = () => {
    if (!audioContext) {
      activateAudioContext();
    }
  };
  return (
    <div onClick={handleWindowClick}>
      <AudioWaveform isOn={currentState === 'ava'} audioContext={audioContext} />
      <ToastManager />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="w-full flex-grow max-h-screen p-3">
          <TabManager
            tabs={tabs}
            activeTab={activeTab}
            createTab={createTab}
            deleteTab={deleteTab}
            updateContent={updateContent}
            setActiveTab={setActiveTab}
          />
          <SBSidebar>
            {' '}
            <ExpansionPanel title="Settings">
              {' '}
              <div>
                <SpeechRecognition
                  active={speechRecognition}
                  onClick={() => {
                    setSpeechRecognition(!speechRecognition);
                  }}
                  onTranscriptionComplete={async (t) => {
                    console.log('speech', t);
                    if ((t === 'Ava' || t === 'ava') && currentState !== 'ava') {
                      setCurrentState('ava');
                    } else if (t.toLowerCase() === 'cancel') {
                      setCurrentState('passive');
                      return;
                    } else if (t.toLowerCase() === 'take notes') {
                      setCurrentState('notes');
                      toastifyInfo('Taking notes');
                    }
                    if (t.split(' ').length < 3 || currentState === 'passive') return;

                    const response = await recognitionRouter({ state: currentState, transcript: t });

                    console.log(response);

                    setTranscript(response as string);
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
            </ExpansionPanel>
            <ExpansionPanel title="Search">
              <SBSearch />
            </ExpansionPanel>
            <ExpansionPanel title="Notes">
              <ScratchPad id="Notes" />
            </ExpansionPanel>
            <ExpansionPanel title="Observations">
              <NotificationCenter placeholder="Nothing to see here 👀" secondaryFilter="agent-observations" />
            </ExpansionPanel>
            <ExpansionPanel title="Agent" isOpened={agentThoughtsOpen} onChange={toggleAgentThoughts}>
              <NotificationCenter placeholder="A place for AI to ponder" secondaryFilter="agent-thought" />
            </ExpansionPanel>
            <ExpansionPanel className="flex-grow" title="Chat" isOpened={chatOpen} onChange={toggleChat}>
              <Chat name="Ava" avatar=".." onSubmitHandler={async (message) => avaChat(message)} />
            </ExpansionPanel>
          </SBSidebar>
        </main>
      </div>
    </div>
  );
}

export default App;
