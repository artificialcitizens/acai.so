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
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  // if there is no workspace id in the url, redirect to welcome page
  const workspaceId = location.pathname.split('/')[1];
  const workspace =
    globalServices.appStateService.getSnapshot().context.workspaces[
      workspaceId
    ];
  const activeTabId = location.pathname.split('/')[2];
  if (!workspace || (workspaceId === 'docs' && !activeTabId))
    navigate('/docs/introduction');
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
