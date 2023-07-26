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
import { makeObservations, queryPinecone } from '../../endpoints';
import { useLocation, useNavigate } from 'react-router-dom';
import { FloatingButton } from '../FloatingButton/FloatingButton';

export const Ava = () => {
  const { appStateService, uiStateService, agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceId = location.pathname.split('/')[1];
  const systemNotes = useSelector(agentStateService, (state) => state.context[workspaceId]?.systemNotes) || '';
  const [openAIApiKey] = useCookieStorage('OPENAI_KEY');
  // const { vectorstore, addDocuments, similaritySearchWithScore } = useMemoryVectorStore(
  //   '',
  //   // add only tabs that are set to be included in the context of the language model
  //   // @TODO: add a tool for Ava to see what the user is working on
  //   // workspace ? workspace.data.tiptap.tabs.map((tab) => tab.isContext && tab.content).join('\n') : '',
  // );
  const [fetchResponse, avaLoading] = useAva();

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
              const response = await queryPinecone(val);
              const newTab = {
                id: Date.now().toString(),
                title: val,
                content: response,
                workspaceId,
              };
              appStateService.send({ type: 'ADD_TAB', tab: newTab });
              navigate(`/${workspaceId}/${newTab.id}`);
            }}
          />
          <TokenManager />
          <StorageMeter />
        </div>
      </ExpansionPanel>
      <ExpansionPanel title="Agent Settings">
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
        className="pb-4"
        title="Agent"
        data-ava-element="TOGGLE_AGENT_THOUGHTS"
        isOpened={true}
        onChange={toggleAgentThoughts}
        onClick={toggleAgentThoughts}
      >
        <NotificationCenter placeholder="A place for AI to ponder 🤔" secondaryFilter="agent-thought" />
      </ExpansionPanel>
      <ExpansionPanel className="chat-panel" isOpened={true}>
        {openAIApiKey && (
          <Chat
            name="Ava"
            avatar=".."
            onSubmitHandler={async (message) => {
              const systemMessage = systemNotes;
              const response = await fetchResponse(message, systemMessage);
              return response;
            }}
          />
        )}
      </ExpansionPanel>
    </SBSidebar>
  );
};

export default Ava;
