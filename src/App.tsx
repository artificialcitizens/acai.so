/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Ava } from './components/Ava/Ava';
import { SideNav } from './components/SideNav/SideNav';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from './context/GlobalStateContext';
import { useLocation, useParams } from 'react-router-dom';
import ToastManager from './components/Toast';
import { VectorStoreContext } from './context/VectorStoreContext';
import { useMemoryVectorStore } from './hooks/use-memory-vectorstore';
import { Editor } from '@tiptap/react';
import { EditorContext } from './context/EditorContext';
import MainView from './components/MainView/MainView';
import useLocationManager from './hooks/use-location-manager';
import { createAcaiDocumentation } from './utils/docs';
import { createWorkspace } from './state';
// import PullToRefresh from 'react-simple-pull-to-refresh';
import { SideNavToggle } from './components/SideNavToggle/SideNavToggle';
import ACModal from './components/Modal/Modal';
import { useSelector } from '@xstate/react';
import AudioWaveform from './components/AudioWaveform/AudioWaveform';
import { useSocketManager } from './hooks/use-socket-manager';
import SocketContext from './context/SocketContext';
import Proto from './components/Proto/Proto';
// import { isMobile } from './utils/browser-support';

const App = ({ proto = false }: { proto?: boolean }) => {
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const { workspaceId, domain } = useParams<{
    workspaceId: string;
    domain: 'knowledge' | 'documents' | undefined;
  }>();
  const { socket } = useSocketManager();
  const [audioContext, setAudioContext] = useState<AudioContext | undefined>(
    undefined,
  );
  const [listening, setListening] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
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

  const workspaceName = useSelector(globalServices.appStateService, (state) => {
    return state.context.workspaces?.[workspaceId || 'docs']?.name;
  });

  const docsAgent = useSelector(globalServices.agentStateService, (state) => {
    return globalServices.agentStateService.getSnapshot().context['docs'];
  });

  const audioContextRef = useRef<AudioContext | undefined>(undefined);

  useEffect(() => {
    if (audioContext) return;
    audioContextRef.current = audioContext;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioContext]);

  useEffect(() => {
    const currentTime = new Date().getTime();
    const lastUpdated = Number(localStorage.getItem('lastUpdated')) || 0;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!docsAgent || currentTime - lastUpdated > twentyFourHours) {
      setLoading(true);
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

        if (!docsAgent) {
          globalServices.agentStateService.send({
            type: 'CREATE_AGENT',
            workspaceId: 'docs',
          });
        }

        // Update the last updated time in localStorage
        localStorage.setItem('lastUpdated', String(currentTime));
      });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // updateLocation(routerLocation.pathname);
  }, [routerLocation, updateLocation]);

  const toggleSideNav = () => {
    globalServices.uiStateService.send({ type: 'TOGGLE_SIDE_NAV' });
  };

  // @TODO: move context activation to a service
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
      <SocketContext.Provider value={socket}>
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
            {/* {audioContext && <TTS audioContext={audioContext} />} */}
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
            <ToastManager />
            {/* <PullToRefresh
            onRefresh={async () => window.location.reload()}
            pullDownThreshold={125}
            maxPullDownDistance={150}
            pullingContent={''}
            isPullable={isMobile()}
          > */}
            <main className="w-screen  max-h-full overflow-hidden">
              <span
                onClick={handleWindowClick}
                className="h-full overflow-hidden flex flex-grow"
              >
                <span className="mt-[.75rem] text-base lg:text-lg font-semibold z-10 max-w-[25vw] truncate w-full flex-grow fixed ml-16">
                  {workspaceName}
                </span>
                {proto ? <Proto /> : <MainView domain={domain} />}
                <Ava
                  workspaceId={workspaceId || 'docs'}
                  onVoiceActivation={setListening}
                  audioContext={audioContext}
                />
              </span>{' '}
            </main>
            {/* </PullToRefresh> */}
          </EditorContext.Provider>
        </VectorStoreContext.Provider>
      </SocketContext.Provider>
    )
  );
};

export default App;
