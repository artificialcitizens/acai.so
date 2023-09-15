/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useContext, useEffect } from 'react';
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
import { Tab, createWorkspace } from './state';
import { VectorStoreContext } from './context/VectorStoreContext';
import { useMemoryVectorStore } from './hooks/use-memory-vectorstore';
import AudioWaveform from './components/AudioWave/AudioWave';
import { Editor } from '@tiptap/react';
import { EditorContext } from './context/EditorContext';
import { createDocs } from './components/TipTap/utils/docs';
import EditorDropzone from './components/TipTap/components/EditorDropzone';
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

  useEffect(() => {
    createDocs().then((docs) => {
      const docsWorkspace = createWorkspace({
        workspaceName: 'acai.so',
        id: 'docs',
        content: docs,
      });
      globalServices.appStateService.send({
        type: 'REPLACE_WORKSPACE',
        id: 'docs',
        workspace: docsWorkspace,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSideNav = () => {
    globalServices.uiStateService.send({ type: 'TOGGLE_SIDE_NAV' });
  };

  const activateAudioContext = () => {
    const newAudioContext = new AudioContext();
    setAudioContext(newAudioContext);
  };

  const handleWindowClick = () => {
    if (!import.meta.env.DEV) return;

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
            <main className="w-full flex flex-grow ">
              <div className="w-full flex flex-col h-screen">
                <div className="ml-16 flex items-center group">
                  {workspace && (
                    <h1 className="m-2 text-lg">{workspace.name}</h1>
                  )}
                  {workspaceId !== 'docs' && (
                    <button
                      className="p-0 px-1  rounded-full font-medium text-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4"
                      onClick={async () => {
                        const confirmDelete = window.prompt(
                          `Please type the name of the workspace to confirm deletion: ${workspace?.name}`,
                        );
                        if (confirmDelete !== workspace?.name) {
                          alert(
                            'Workspace name does not match. Deletion cancelled.',
                          );
                          return;
                        }
                        globalServices.appStateService.send({
                          type: 'DELETE_WORKSPACE',
                          id: workspace?.id,
                        });
                        globalServices.agentStateService.send({
                          type: 'DELETE_AGENT',
                          workspaceId: workspace?.id,
                        });
                        setTimeout(() => {
                          navigate('/');
                        }, 250);
                      }}
                    >
                      x
                    </button>
                  )}
                </div>

                <div className="max-h-[calc(100vh-2rem)] overflow-scroll">
                  <EditorDropzone
                    workspaceId={workspaceId}
                    activeTab={!!activeTab}
                  >
                    {activeTab && <TipTap tab={activeTab} />}
                  </EditorDropzone>
                </div>
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
             */}
            </main>
          </div>{' '}
        </EditorContext.Provider>
      </VectorStoreContext.Provider>
    )
  );
}

export default App;
