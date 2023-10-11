import React, { useContext } from 'react';
import SBSidebar from '../Sidebar/SBSidebar';
import { ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import NotificationCenter from '../../components/NotificationCenter';
import Chat from '../../components/Chat/Chat';
import ScratchPad from '../../components/ScratchPad/ScratchPad';
import TokenManager from '../../components/TokenManager/token-manager';
import { useActor, useSelector } from '@xstate/react';
import { useAva } from './use-ava';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import VoiceRecognition from '../VoiceRecognition/VoiceRecognition';
import ChatModelDropdown from '../ChatSettings';
import { SocketManager } from '../SocketManager';
import UserProfile from '../UserProfile/UserProfile';
import { toastifyError } from '../Toast';
import KnowledgeUpload from '../Knowledge/Knowledge';

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
  const { uiStateService, agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const systemNotes =
    useSelector(
      agentStateService,
      (state) => state.context[workspaceId]?.systemNotes,
    ) || '';
  const { queryAva, streamingMessage, loading } = useAva();
  const [uiState] = useActor(uiStateService);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const currentAgentMode =
    agentStateService.getSnapshot().context[workspaceId]?.agentMode;

  const toggleAgentThoughts = () => {
    uiStateService.send({ type: 'TOGGLE_AGENT_THOUGHTS' });
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

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
        title="Settings"
        onChange={toggleSettings}
        isOpened={settingsOpen}
        tabIndex={0}
        // onKeyDown={toggleSettings}
      >
        <h5 className="text-acai-white text-sm md:text-xs pb-2 pl-1 md:pl-2 font-bold mb-3 border-b border-b-light border-b-solid">
          User Profile
        </h5>
        <p className="text-xs font-medium mb-4">
          Personalize your AVA interactions
        </p>
        <UserProfile />
        <h5 className="text-acai-white text-sm md:text-xs pb-2 pl-1 md:pl-2 font-bold mb-3 border-b border-b-light border-b-solid">
          Access Configuration
        </h5>
        <TokenManager />
      </ExpansionPanel>

      <ExpansionPanel
        title="Logs"
        data-ava-element="TOGGLE_AGENT_THOUGHTS"
        onChange={toggleAgentThoughts}
        isOpened={uiState.context.thoughtsOpen}
      >
        <NotificationCenter
          placeholder="A place for AI to ponder"
          secondaryFilter="agent-thought"
        />
      </ExpansionPanel>

      <ExpansionPanel title="Voice Synthesis">
        <VoiceRecognition
          onVoiceActivation={onVoiceActivation}
          audioContext={audioContext}
        />
      </ExpansionPanel>

      <ExpansionPanel title="Knowledge">
        <KnowledgeUpload workspaceId={workspaceId} />
      </ExpansionPanel>

      <ExpansionPanel title="AVA">
        <ChatModelDropdown workspaceId={workspaceId} />

        {agentStateService.getSnapshot().context[workspaceId]?.agentMode ===
          'custom' && (
          <>
            <h5 className="text-acai-white text-sm md:text-xs pb-2 pl-3 font-bold mb-3 border-b border-b-light border-b-solid">
              Custom Agent Server
            </h5>
            <SocketManager />
          </>
        )}
        <ScratchPad
          placeholder="Custom Prompt"
          content={systemNotes}
          handleInputChange={(e) => {
            agentStateService.send({
              type: 'UPDATE_SYSTEM_NOTES',
              workspaceId: workspaceId,
              systemNotes: e.target.value,
            });
          }}
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
