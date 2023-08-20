/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useContext } from 'react';
import { Ava } from './components/Ava/Ava';
import { SideNav } from './components/SideNav/SideNav';
import { FloatingButton } from './components/FloatingButton/FloatingButton';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from './context/GlobalStateContext';
import { useLocation } from 'react-router-dom';
import ToastManager from './components/Toast';
import TipTap from './components/TipTap/TipTap';
import { Tab } from './state';
import { VectorStoreContext } from './context/VectorStoreContext';
import { useMemoryVectorStore } from './hooks/use-memory-vectorstore';
import AudioWaveform from './components/AudioWave/AudioWave';
import { Editor } from '@tiptap/react';
import { EditorContext } from './context/EditorContext';
// import useTypeTag from './hooks/ac-langchain/use-type-tag';
// const [userLocation, setUserLocation] = useState<string>('Portland, OR');

function App() {
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const activeTabId = location.pathname.split('/')[2];
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(
    undefined,
  );
  const [listening, setListening] = useState<boolean>(false);

  const [editor, setEditor] = useState<Editor | null>(null);
  const {
    vectorstore,
    addDocuments,
    addText,
    similaritySearchWithScore,
    filterAndCombineContent,
  } = useMemoryVectorStore('');

  const toggleSideNav = () => {
    globalServices.uiStateService.send({ type: 'TOGGLE_SIDE_NAV' });
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

  const workspace =
    globalServices.appStateService.getSnapshot().context.workspaces[
      workspaceId
    ];
  const activeTab: Tab =
    workspace &&
    workspace.data.tiptap.tabs.find((tab: Tab) => tab.id === activeTabId);
  return (
    globalServices.appStateService && (
      <VectorStoreContext.Provider
        value={{
          vectorstore,
          addText,
          addDocuments,
          similaritySearchWithScore,
          filterAndCombineContent,
        }}
      >
        <EditorContext.Provider value={{ editor, setEditor }}>
          <SideNav></SideNav>
          {audioContext && (
            <AudioWaveform audioContext={audioContext} isOn={listening} />
          )}
          <FloatingButton
            handleClick={(e) => {
              e.stopPropagation();
              toggleSideNav();
            }}
          />
          <div
            className="w-screen h-screen flex flex-col sm:flex-row flex-wrap sm:flex-nowrap flex-grow p-0"
            onClick={handleWindowClick}
          >
            <ToastManager />
            {/* @TODO: Setup non workspace and tab view */}
            <main className="w-full flex flex-grow ">
              <div className="w-full flex flex-col h-screen">
                <div className="ml-16">
                  {workspace && (
                    <h1 className="m-2 text-lg">{workspace.name}</h1>
                  )}
                </div>
                {activeTab && <TipTap tab={activeTab} />}
                {}
              </div>
              <Ava
                workspaceId={workspaceId}
                onVoiceActivation={setListening}
                audioContext={audioContext}
              />
              {/* 
                <Whisper
                onRecordingComplete={(blob) => console.log(blob)}
                onTranscriptionComplete={async (t) => {
                  console.log('Whisper Server Response', t);
                }}
              />
                <RoomManager />
             */}
            </main>
          </div>{' '}
        </EditorContext.Provider>
      </VectorStoreContext.Provider>
    )
  );
}

export default App;
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
