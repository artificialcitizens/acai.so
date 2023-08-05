/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useContext } from 'react';
import Whisper from './components/Whisper';
import VoiceRecognition from './components/VoiceRecognition/VoiceRecognition';
import SocketContext from './context/SocketContext';
import TabManager from './components/Tabs';
import { Ava } from './components/Ava/Ava';
import { SideNav } from './components/SideNav/SideNav';
import { FloatingButton } from './components/FloatingButton/FloatingButton';
import { GlobalStateContext, GlobalStateContextValue } from './context/GlobalStateContext';
import { useLocation } from 'react-router-dom';
import ToastManager from './components/Toast';
// const [userLocation, setUserLocation] = useState<string>('Portland, OR');

function App() {
  const globalServices: GlobalStateContextValue = useContext(GlobalStateContext);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(undefined);

  // const { vectorstore, addDocuments, similaritySearchWithScore } = useMemoryVectorStore(
  //   '',
  //   // add only tabs that are set to be included in the context of the language model
  //   // @TODO: add a tool for Ava to see what the user is working on
  //   // workspace ? workspace.data.tiptap.tabs.map((tab) => tab.isContext && tab.content).join('\n') : '',
  // );

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

  const workspace = globalServices.appStateService.getSnapshot().context.workspaces[workspaceId];
  return (
    globalServices.appStateService && (
      // <VectorStoreContext.Provider value={{ vectorstore, addDocuments, similaritySearchWithScore }}>
      <>
        <SideNav></SideNav>
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
          <main className="w-full flex flex-grow ">
            <div className="w-full flex flex-col">
              <div className="h-12 ml-16">{workspace && <h1 className="m-2 text-lg">{workspace.name}</h1>}</div>
              <TabManager />
            </div>
            <Ava audioContext={audioContext} />
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
        {/* </VectorStoreContext.Provider> */}
      </>
    )
  );
}

export default App;
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
