/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useContext } from 'react';
import Whisper from './components/Whisper';
import ElevenLabs from './components/Elevenlabs/ElevenLabs';
import SpeechRecognition from './components/SpeechRecognition/SpeechRecognition';
import { recognitionRouter, takeNotesRoute } from './components/SpeechRecognition/recognition-manager';
import ToastManager, {
  toastifyAgentObservation,
  toastifyAgentThought,
  toastifyError,
  toastifyInfo,
} from './components/Toast';
import RoomManager from './components/RoomManager/RoomManager';
import { avaChat } from './utils/sb-langchain/agents/ava';
import AudioWaveform from './components/AudioWave/AudioWave';
import SocketContext from './context/SocketContext';
import SBSidebar from './components/Sidebar';
import { Header, ProjectLinks } from './components/ProjectLinks/ProjectLinks';
import TabManager from './components/Tabs';
import StorageMeter from './components/StorageMeter/StorageMeter';
import { ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import NotificationCenter from './components/NotificationCenter';
import Chat from './components/Chat/Chat';
import SBSearch from './components/Search';
import ScratchPad from './components/ScratchPad/ScratchPad';
import { makeObservations, queryPinecone } from './endpoints';
export type State = 'idle' | 'passive' | 'ava' | 'notes' | 'strahl' | 'chat';
import { Workspace, appStateMachine, saveState, handleCreateTab } from './state/app.xstate';
import TokenManager from './components/TokenManager/token-manager';
import { WorkspaceManager } from './components/WorkspaceManager/workspace-manager';
import { useInterpret, useMachine, useSelector } from '@xstate/react';
import useCookieStorage from './hooks/use-cookie-storage';
import { useMemoryVectorStore } from './hooks/use-memory-vectorstore';
import { VectorStoreContext } from './context/VectorStoreContext';
import { useAva } from './hooks/use-ava';
import { SideNav } from './components/SideNav/SideNav';
import { FloatingButton } from './components/FloatingButton/FloatingButton';
import { GlobalStateContext } from './context/GlobalStateContext';
import { useLocation } from 'react-router-dom';
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
const activeWorkspaceSelector = (state) => {
  if (state.context && state.context.activeWorkspaceId) {
    console.log('you did it!');
    return true;
  }
  if (state.context && state.context.activeTabId) {
    console.log('you did it!');
    return true;
  }

  return false;
};
function App() {
  // const [agentTranscript, setAgentTranscript] = useState<string>('');
  // const [voice2voice, setVoice2voice] = useState<boolean>(false);
  // const [speechRecognition, setSpeechRecognition] = useState<boolean>(true);
  // const [userTranscript, setUserTranscript] = useState<string>('');
  // const [currentState, setCurrentState] = useState<State>('idle');
  // const [observations, setObservations] = useState<string>('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [agentThoughtsOpen, setAgentThoughtsOpen] = useState(true);
  const globalServices = useContext(GlobalStateContext);
  const service = useInterpret(appStateMachine);
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [tabId, setTabId] = useState<string>('');
  const workspace = service.getSnapshot().context.workspaces[workspaceId];
  const [openAIApiKey] = useCookieStorage('OPENAI_KEY');
  const { vectorstore, addDocuments, similaritySearchWithScore } = useMemoryVectorStore(
    '',
    // add only tabs that are set to be included in the context of the language model
    // @TODO: add a tool for Ava to see what the user is working on
    // workspace ? workspace.data.tiptap.tabs.map((tab) => tab.isContext && tab.content).join('\n') : '',
  );
  const [fetchResponse, avaLoading] = useAva();
  const [sideNavHidden, setSideNavHidden] = useState(true);
  const [scratchpadContent, setScratchpadContent] = useState('');
  const location = useLocation();

  useEffect(() => {
    const workspaceId = location.pathname.split('/')[1];
    const tabId = location.pathname.split('/')[2];
    if (workspaceId) {
      globalServices.appStateService.send({ type: 'SET_ACTIVE_WORKSPACE', workspaceId });
      setWorkspaceId(workspaceId);
    }

    if (tabId) {
      globalServices.appStateService.send({ type: 'SET_ACTIVE_TAB', tabId });
      setTabId(tabId);
    }
  }, [globalServices, location]);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const toggleAgentThoughts = () => {
    setAgentThoughtsOpen(!agentThoughtsOpen);
  };

  const activateAudioContext = () => {
    const newAudioContext = new AudioContext();
    setAudioContext(newAudioContext);
  };
  const handleWindowClick = () => {
    if (!audioContext) {
      activateAudioContext();
    }
  };

  // update the state on handleInputChange
  const handleSystemNoteUpdate = (event) => {
    const newNotes = event.target.value;
    setScratchpadContent(newNotes);
    globalServices.appStateService.send({ type: 'UPDATE_NOTES', id: workspaceId, notes: newNotes });
  };

  return (
    globalServices.appStateService && (
      <VectorStoreContext.Provider value={{ vectorstore, addDocuments, similaritySearchWithScore }}>
        <SideNav
          isToggled={sideNavHidden}
          handleToggle={() => {
            setSideNavHidden(!sideNavHidden);
          }}
        ></SideNav>
        <FloatingButton
          handleClick={() => {
            setSideNavHidden(!sideNavHidden);
          }}
        />
        <div
          className="w-screen h-screen flex flex-col sm:flex-row flex-wrap sm:flex-nowrap flex-grow p-2"
          onClick={handleWindowClick}
        >
          <ToastManager />
          {/* <AudioWaveform isOn={currentState === 'ava'} audioContext={audioContext} /> */}
          <main className="w-full flex flex-grow">
            <div className="w-full flex flex-col">
              <div className="h-12 ml-16">{workspace && <h1 className="m-0 text-lg">{workspace.name}</h1>}</div>
              <TabManager key={workspaceId} activeWorkspaceId={workspaceId} activeTabId={tabId} />
            </div>
            <SBSidebar>
              {' '}
              <ExpansionPanel title="Junk Drawer">
                <div className="w-full">
                  <ProjectLinks />

                  <SBSearch
                    onSubmit={async (val) => {
                      const response = await queryPinecone(val);
                      console.log('response', response);
                      const newTab = {
                        id: Date.now().toString(),
                        title: val,
                        content: response,
                        workspaceId: workspaceId,
                      };
                      globalServices.appStateService.send({ type: 'ADD_TAB', tab: newTab });
                    }}
                  />
                  <TokenManager />
                  <StorageMeter />
                </div>
                {/* <SpeechRecognition
                  active={speechRecognition}
                  onClick={() => {
                    setSpeechRecognition(!speechRecognition);
                  }}
                  onTranscriptionComplete={handleTranscription}
                /> */}
                {/* <ElevenLabs
                  active={currentState === 'ava' || currentState === 'strahl'}
                  text={agentTranscript}
                  voice={currentState === 'ava' ? 'ava' : 'strahl'}
                /> */}
                {/* <Whisper
                onRecordingComplete={(blob) => console.log(blob)}
                onTranscriptionComplete={async (t) => {
                  console.log('Whisper Server Response', t);
                }}
              /> */}
                {/* <RoomManager /> */}
              </ExpansionPanel>
              <ExpansionPanel title="Agent Settings">
                <ScratchPad
                  placeholder="Agent Refinement"
                  content={scratchpadContent}
                  handleInputChange={handleSystemNoteUpdate}
                />
              </ExpansionPanel>
              {/* <ExpansionPanel title="Observations">
              <NotificationCenter placeholder="Always listening 👂" secondaryFilter="agent-observation" />
            </ExpansionPanel> */}
              <ExpansionPanel title="Agent" isOpened={agentThoughtsOpen} onChange={toggleAgentThoughts}>
                <NotificationCenter placeholder="A place for AI to ponder 🤔" secondaryFilter="agent-thought" />
              </ExpansionPanel>
              <ExpansionPanel className="flex-grow" title="Chat" isOpened={chatOpen} onChange={toggleChat}>
                {openAIApiKey && (
                  <Chat
                    name="Ava"
                    avatar=".."
                    onSubmitHandler={async (message) => {
                      const systemMessage =
                        globalServices.appStateService.state.context.workspaces[workspaceId].data.notes || '';
                      const response = await fetchResponse(message, systemMessage);
                      return response;
                    }}
                  />
                )}
              </ExpansionPanel>
            </SBSidebar>
          </main>
        </div>{' '}
      </VectorStoreContext.Provider>
    )
  );
}

export default App;
/**
 *  Handles sending notes to the to the notes chain
 */
// const handleSendNotes = async (openAIKey: string) => {
//   toastifyInfo('Preparing notes');
//   setCurrentState('idle');
//   const notes = await takeNotesRoute(userTranscript, openAIKey);
//   setUserTranscript('');
//   toastifyInfo('Notes sent');

//   const newTab = {
//     id: Date.now().toString(),
//     title: 'Notes',
//     content: notes,
//     workspaceId: workspace.id,
//   };

//   send({ type: 'ADD_TAB', tab: newTab });
// };
// useEffect(() => {
//   getGeolocation();
// }, []);

// const delay = 100000;
// useEffect(() => {
//   let intervalId: NodeJS.Timeout;

//     if (currentState === 'passive') {
//       intervalId = setInterval(async () => {
//         const newObservations = await makeObservations(userTranscript, observations);
//         setObservations(newObservations);
//       }, delay);
//     }

//   return () => {
//     clearInterval(intervalId);
//   };
// }, [currentState, delay, userTranscript]);

// const handleTranscription = async (t: string) => {
//   if (!openAIKey) {
//     toastifyInfo('Please set your OpenAI key in the settings');
//     return;
//   }
//   if ((t === 'Ava' || t === 'ava') && currentState !== 'ava') {
//     setCurrentState('ava');
//   } else if (t.toLowerCase() === 'cancel') {
//     setCurrentState('idle');
//     toastifyInfo('Going Idle');
//     return;
//   } else if (t.toLowerCase() === 'take notes') {
//     setUserTranscript('');
//     setCurrentState('notes');
//     toastifyInfo('Taking notes');
//   } else if (t.toLowerCase() === 'ready' && currentState === 'notes') {
//     handleSendNotes(openAIKey);
//     return;
//   } else {
//     const newTranscript = userTranscript + '\n' + t;
//     setUserTranscript(newTranscript);
//   }
//   if (t.split(' ').length < 3 || currentState === 'idle') return;

//   if (!socket) return;

//   const response = await recognitionRouter({ state: currentState, transcript: t, openAIKey, callbacks });

//   setAgentTranscript(response as string);
// };

// const socket = useContext(SocketContext);

// useEffect(() => {
//   if (!socket) return;

//   const handleConnect = () => console.log(`Connected: ${socket.id}`);
//   const handleMessage = (message: string) => console.log(message);
//   const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);

//   // const handleAgentObservation = (observation: { content: string }) => {
//   //   // setCurrentTool(observation.content);
//   //   // const thought = observation.log.split('Observation:')[0].trim();
//   //   toastifyAgentObservation(observation.content);
//   // };

//   socket.on('connect', handleConnect);
//   socket.on('message', handleMessage);
//   socket.on('disconnect', handleDisconnect);
//   socket.on('create-tab', (data) =>
//     handleCreateTab({ title: data.title, content: data.content }, send, workspace.id),
//   );

//   return () => {
//     socket.off('connect', handleConnect);
//     socket.off('message', handleMessage);
//     socket.off('disconnect', handleDisconnect);
//     socket.off('create-tab', (data) =>
//       handleCreateTab({ title: data.title, content: data.content }, send, workspace.id),
//     );
//   };

//   // HERE IS HOW TO USE TOOLS VIA SOCKET BY HAVING THE TOOL SEND THE ACTION THROUGH SOCKET
//   // socket.on('agent-action', (action: string) => {
//   //   console.log('agent-action', action);
//   //   if (action === 'start-listening') {
//   //     setAvaListening(true);
//   //   } else if (action === 'stop-listening') {
//   //     setAvaListening(false);
//   //   }
//   // });
// }, [send, socket, workspace]); // specify the dependencies here
