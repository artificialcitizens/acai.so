import React, { useContext } from 'react';
import SBSidebar from '../../components/Sidebar';
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
import Knowledge from '../Knowledge/Knowledge';

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

  const toggleAgentThoughts = () => {
    uiStateService.send({ type: 'TOGGLE_AGENT_THOUGHTS' });
  };

  const toggleAgentChat = () => {
    uiStateService.send({ type: 'TOGGLE_AGENT_CHAT' });
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <SBSidebar>
      <ExpansionPanel
        title="Settings"
        onChange={toggleSettings}
        isOpened={settingsOpen}
      >
        <h5 className="text-acai-white text-xs pb-2 pl-4 font-bold mb-3 border-b border-b-light border-b-solid">
          User Profile
        </h5>
        <p className="text-xs font-medium mb-4">
          Personalize your AVA interactions
        </p>
        <UserProfile />
        <h5 className="text-acai-white text-xs pb-2 pl-4 font-bold mb-3 border-b border-b-light border-b-solid">
          Tokens
        </h5>
        <TokenManager />
      </ExpansionPanel>
      <ExpansionPanel title="Knowledge">
        <Knowledge workspaceId={workspaceId} />
      </ExpansionPanel>
      {import.meta.env.DEV && (
        <ExpansionPanel title="Voice Synthesis">
          <VoiceRecognition
            onVoiceActivation={onVoiceActivation}
            audioContext={audioContext}
          />
        </ExpansionPanel>
      )}

      <ExpansionPanel title="AVA">
        <ChatModelDropdown workspaceId={workspaceId} />
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
        <h5 className="text-acai-white text-xs pb-2 pl-4 font-bold mb-3 border-b border-b-light border-b-solid">
          Custom Agent Server
        </h5>
        <SocketManager />
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
      <ExpansionPanel
        title="Chat"
        className="chat-panel"
        onChange={toggleAgentChat}
        isOpened={uiState.context.agentChatOpen}
      >
        {workspaceId && (
          <Chat
            name="Ava"
            avatar=".."
            abortController={null}
            loading={loading}
            streamingMessage={streamingMessage}
            onSubmitHandler={async (message) => {
              try {
                const { response } = await queryAva(message, systemNotes);
                return response;
              } catch (e: any) {
                toastifyError(e.message);
                return 'Sorry, I had an issue processing your query.';
              }
            }}
          />
        )}
      </ExpansionPanel>
    </SBSidebar>
  );
};

export default Ava;
