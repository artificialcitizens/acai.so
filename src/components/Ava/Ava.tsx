import React, { useContext, useState } from 'react';
import SBSidebar from '../Sidebar/SBSidebar';
import { ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import Chat from '../../components/Chat/Chat';
import { useSelector } from '@xstate/react';
import { useAva } from './use-ava';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import QuickSettings from '../QuickSettings/QuickSettings';
import { toastifyError } from '../Toast';
// import AvaButton from '../AvaNav/AvaButton';
// import { EllipsisMenuIcon } from '../Icons/Icons';
// import './Ava.css';

interface AvaProps {
  workspaceId: string;
  audioContext?: AudioContext;
  onVoiceActivation: (bool: boolean) => void;
}

export const Ava: React.FC<AvaProps> = ({
  workspaceId,
  onVoiceActivation,
  audioContext,
}) => {
  const { agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const systemNotes =
    useSelector(
      agentStateService,
      (state) => state.context[workspaceId]?.customPrompt,
    ) || '';
  const { queryAva, streamingMessage, loading } = useAva();

  const currentAgentMode = useSelector(
    agentStateService,
    (state) => state.context[workspaceId]?.agentMode,
  );

  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);

  const formatAgentMode = (mode: string) => {
    if (!mode) return '';
    switch (mode) {
      case 'ava':
        return 'Chat - AVA';
      case 'chat':
        return 'Chat';
      default:
        return 'Chat - ' + mode.charAt(0).toUpperCase() + mode.slice(1);
    }
  };

  return (
    <SBSidebar>
      {/* <AvaButton
        className="fixed right-0 top-9 md:top-6 mr-2 md:mr-4"
        onClick={() => {
          setQuickSettingsOpen(!quickSettingsOpen);
        }}
      >
        <EllipsisMenuIcon />
      </AvaButton> */}
      <ExpansionPanel
        className="pt-10 md:pt-8 pl-1 text-sm border-0 !hover:cursor-default"
        isOpened={quickSettingsOpen}
        onChange={() => {
          setQuickSettingsOpen(!quickSettingsOpen);
        }}
        title={formatAgentMode(currentAgentMode)}
      >
        <QuickSettings
          onVoiceActivation={onVoiceActivation}
          audioContext={audioContext}
        />
      </ExpansionPanel>
      {workspaceId && !quickSettingsOpen && (
        <span className="flex flex-col flex-grow">
          <div className="flex flex-col flex-grow p-2 pt-0 mb-2 md:mb-0">
            <Chat
              name="Ava"
              avatar=".."
              abortController={null}
              loading={loading}
              streamingMessage={streamingMessage}
              onSubmitHandler={async (message) => {
                try {
                  const { response } = await queryAva({
                    message,
                    systemMessage: systemNotes,
                  });
                  return response;
                } catch (e: any) {
                  toastifyError(e.message);
                  return 'Sorry, I had an issue processing your query.';
                }
              }}
            />
          </div>
        </span>
      )}
    </SBSidebar>
  );
};

export default Ava;
