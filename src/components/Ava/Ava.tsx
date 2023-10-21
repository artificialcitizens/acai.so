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
import VoiceRecognition from '../VoiceRecognition/VoiceRecognition';
import { toastifyError } from '../Toast';

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

  const currentAgentMode =
    agentStateService.getSnapshot().context[workspaceId]?.agentMode;

  const formatAgentMode = (mode: string) => {
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
      <ExpansionPanel
        className="pt-8 md:pt-6 border-t-0"
        title="Voice Synthesis"
      >
        <VoiceRecognition
          onVoiceActivation={onVoiceActivation}
          audioContext={audioContext}
        />
      </ExpansionPanel>

      {workspaceId && (
        <span className="flex flex-col flex-grow">
          <p className="text-sm md:text-xs font-bold p-3">
            {formatAgentMode(currentAgentMode)}{' '}
            {/* @TODO: create a tag component */}
            {/* <span
              className="ml-2 font-semibold border-lighter border-solid border p-1 px-2 rounded-xl text-[9px]"
              style={{
                borderColor:
                  currentAgentMode === 'chat' ? 'transparent' : 'currentcolor',
              }}
            >
              {formatAgentMode(currentAgentMode)}
            </span> */}
          </p>
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
