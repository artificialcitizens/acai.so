/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useContext, useEffect } from 'react';
import { Ava } from './components/Ava/Ava';
import { SideNav } from './components/SideNav/SideNav';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from './context/GlobalStateContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ToastManager from './components/Toast';
import { VectorStoreContext } from './context/VectorStoreContext';
import { useMemoryVectorStore } from './hooks/use-memory-vectorstore';
import AudioWaveform from './components/AudioWave/AudioWave';
import { Editor } from '@tiptap/react';
import { EditorContext } from './context/EditorContext';
import MainView from './components/MainView/MainView';
import useLocationManager from './hooks/use-location-manager';
import { createDocs } from './components/TipTap/utils/docs';

import { MenuButton } from './components/MenuButton/MenuButton';
import ACModal from './components/Modal/Modal';
import { createWorkspace } from './state';

const App = () => {
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const {
    workspaceId,
    domain,
    id: docId,
  } = useParams<{
    workspaceId: string;
    domain: 'knowledge' | 'documents' | undefined;
    id: string;
  }>();

  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(
    undefined,
  );
  const [listening, setListening] = useState<boolean>(false);
  const routerLocation = useLocation();
  const [editor, setEditor] = useState<Editor | null>(null);
  const {
    vectorstore,
    addDocuments,
    addText,
    similaritySearchWithScore,
    filterAndCombineContent,
  } = useMemoryVectorStore('');
  const { updateLocation } = useLocationManager();

  // useEffect(() => {
  //   if (!workspace || !id) navigate('/docs/documents/1-introduction');
  // }, [workspace, id, navigate]);

  useEffect(() => {
    updateLocation(routerLocation.pathname);
  }, [routerLocation, updateLocation]);

  useEffect(() => {
    createDocs().then((docs) => {
      const docsWorkspace = createWorkspace({
        workspaceName: 'acai.so',
        id: 'docs',
        content: docs,
      });
      if (!docsWorkspace) return;
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
          <SideNav />
          <ACModal />
          <MenuButton
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
            <main className="w-screen flex flex-grow">
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
