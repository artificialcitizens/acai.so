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
import { useNavigate, useParams } from 'react-router-dom';
import ToastManager from './components/Toast';
import { createWorkspace } from './state';
import { VectorStoreContext } from './context/VectorStoreContext';
import { useMemoryVectorStore } from './hooks/use-memory-vectorstore';
import AudioWaveform from './components/AudioWave/AudioWave';
import { Editor } from '@tiptap/react';
import { EditorContext } from './context/EditorContext';
import { createDocs } from './components/TipTap/utils/docs';
import MainView from './components/MainView/MainView';

const App = () => {
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const { workspaceId, domain, id } = useParams<{
    workspaceId: string;
    domain: 'knowledge' | 'documents' | undefined;
    id: string;
  }>();
  const navigate = useNavigate();
  const workspace =
    globalServices.appStateService.getSnapshot().context.workspaces[
      workspaceId || 'docs'
    ];
  if (!workspace || !id) navigate('/docs/documents/1---introduction');

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
          <FloatingButton
            handleClick={(e) => {
              e.stopPropagation();
              toggleSideNav();
            }}
          />
          {audioContext && (
            <AudioWaveform audioContext={audioContext} isOn={listening} />
          )}
          <div
            className="w-screen h-screen flex flex-col sm:flex-row flex-wrap sm:flex-nowrap flex-grow p-0"
            onClick={handleWindowClick}
          >
            <ToastManager />
            <main className="w-full flex flex-grow ">
              {workspaceId && (
                <>
                  <MainView domain={domain} />
                  <Ava
                    workspaceId={workspaceId}
                    onVoiceActivation={setListening}
                    audioContext={audioContext}
                  />
                </>
              )}
            </main>
          </div>{' '}
        </EditorContext.Provider>
      </VectorStoreContext.Provider>
    )
  );
};

export default App;
