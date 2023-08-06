import React, { useContext } from 'react';
import SBSidebar from '../../components/Sidebar';
import { ProjectLinks } from '../../components/ProjectLinks/ProjectLinks';
import StorageMeter from '../../components/StorageMeter/StorageMeter';
import { ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import NotificationCenter from '../../components/NotificationCenter';
import Chat from '../../components/Chat/Chat';
import SBSearch from '../../components/Search';
import ScratchPad from '../../components/ScratchPad/ScratchPad';
import TokenManager from '../../components/TokenManager/token-manager';
import { useSelector } from '@xstate/react';
import useCookieStorage from '../../hooks/use-cookie-storage';
import { useAva } from '../../hooks/use-ava';
import { GlobalStateContext, GlobalStateContextValue } from '../../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import VoiceRecognition from '../VoiceRecognition/VoiceRecognition';
import { useMemoryVectorStore } from '../../hooks/use-memory-vectorstore';
import { Tab } from '../../state';

interface AvaProps {
  audioContext?: AudioContext;
}

export const Ava: React.FC<AvaProps> = ({ audioContext }) => {
  const { appStateService, uiStateService, agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceId = location.pathname.split('/')[1];
  const workspace = appStateService.getSnapshot().context.workspaces[workspaceId];
  const activeTabId = location.pathname.split('/')[2];
  const activeTab: Tab = workspace && workspace.data.tiptap.tabs.find((tab: Tab) => tab.id === activeTabId);
  const systemNotes = useSelector(agentStateService, (state) => state.context[workspaceId]?.systemNotes) || '';
  const [openAIApiKey] = useCookieStorage('OPENAI_KEY');
  const [fetchResponse, avaLoading] = useAva();
  const context = workspace
    ? workspace.data.tiptap.tabs.map((tab: Tab) => (tab.isContext ? tab.content : '')).join('\n')
    : '';
  const { filterAndCombineContent, similaritySearchWithScore } = useMemoryVectorStore(context);
  const toggleChat = () => {
    uiStateService.send({ type: 'TOGGLE_AGENT_CHAT' });
  };

  const toggleAgentThoughts = () => {
    uiStateService.send({ type: 'TOGGLE_AGENT_THOUGHTS' });
  };

  return (
    <SBSidebar>
      {' '}
      <ExpansionPanel data-ava-element="junk-drawer-panel-toggle" title="Junk Drawer">
        <div className="w-full">
          <ProjectLinks />
          <SBSearch
            onSubmit={async (val) => {
              const response = await similaritySearchWithScore(val);
              console.log('response', response);
              const results = filterAndCombineContent(response, 0.78);
              const newTab: Tab = {
                id: Date.now().toString(),
                title: val,
                content: results,
                workspaceId,
                isContext: false,
                createdAt: new Date().toString(),
                lastUpdated: new Date().toString(),
                filetype: 'markdown',
                systemNote: '',
              };
              appStateService.send({ type: 'ADD_TAB', tab: newTab });
              navigate(`/${workspaceId}/${newTab.id}`);
            }}
          />
          <TokenManager />
          <StorageMeter />
        </div>
      </ExpansionPanel>
      <ExpansionPanel title="Voice Synthesis">
        <VoiceRecognition audioContext={audioContext} />
      </ExpansionPanel>
      <ExpansionPanel title="Settings">
        <ScratchPad
          placeholder="Agent Refinement"
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
      <ExpansionPanel
        title="Logs"
        data-ava-element="TOGGLE_AGENT_THOUGHTS"
        onChange={toggleAgentThoughts}
        onClick={toggleAgentThoughts}
        isOpened={uiStateService.getSnapshot().context.agentThoughts}
      >
        <NotificationCenter placeholder="A place for AI to ponder 🤔" secondaryFilter="agent-thought" />
      </ExpansionPanel>
      <ExpansionPanel title="Chat" className="chat-panel" isOpened={true}>
        {openAIApiKey && (
          <Chat
            name="Ava"
            avatar=".."
            onSubmitHandler={async (message) => {
              const response = await fetchResponse(message, systemNotes);
              return response;
            }}
          />
        )}
      </ExpansionPanel>
    </SBSidebar>
  );
};

export default Ava;
