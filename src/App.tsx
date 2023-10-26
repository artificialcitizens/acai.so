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
import { createAcaiDocumentation } from './utils/docs';
import { createWorkspace } from './state';

import { SideNavToggle } from './components/SideNavToggle/SideNavToggle';
import ACModal from './components/Modal/Modal';

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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      setTouchStart(e.targetTouches[0].clientY);
    }

    function handleTouchMove(e: TouchEvent) {
      setTouchEnd(e.targetTouches[0].clientY);
    }

    function handleTouchEnd() {
      if (touchStart - touchEnd > 150) {
        // Refresh logic here
        window.location.reload();
      }
    }

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd]);

  useEffect(() => {
    // if (
    //   globalServices.appStateService.getSnapshot().context.workspaces?.['docs']
    // )
    //   return;
    createAcaiDocumentation().then((d) => {
      const { workspace, docs } = createWorkspace({
        workspaceName: 'acai.so',
        id: 'docs',
        docs: d,
      });
      if (!workspace) return;
      // @TODO: rename to load docs
      globalServices.appStateService.send({
        type: 'REPLACE_WORKSPACE',
        id: 'docs',
        workspace: workspace,
        docs: docs,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateLocation(routerLocation.pathname);
  }, [routerLocation, updateLocation]);

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
          <SideNavToggle
            className="fixed top-0 left-0 z-20"
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
