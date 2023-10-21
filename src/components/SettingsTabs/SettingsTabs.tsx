import React, { useContext } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './Settings.css';
import { ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import NotificationCenter from '../../components/NotificationCenter';
import ScratchPad from '../../components/ScratchPad/ScratchPad';
import TokenManager from '../../components/TokenManager/token-manager';
import { useSelector } from '@xstate/react';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import ChatModelDropdown from '../ChatSettings';
import { SocketManager } from '../SocketManager';
import UserProfile from '../UserProfile/UserProfile';
import KnowledgeUpload from '../Knowledge/Knowledge';
import { useParams } from 'react-router-dom';

interface SettingsProps {
  initialTabIndex?: number;
}

const Settings: React.FC<SettingsProps> = ({
  initialTabIndex = 0,
}: SettingsProps) => {
  const [tabIndex, setTabIndex] = React.useState(initialTabIndex);
  const { agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [userSettingsOpen, setUserSettingsOpen] = React.useState(false);
  const { workspaceId } = useParams<{
    workspaceId: string;
    domain: 'knowledge' | 'documents' | undefined;
    id: string;
  }>();

  const systemNotes =
    (workspaceId &&
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSelector(
        agentStateService,
        (state) => state.context[workspaceId]?.systemNotes,
      )) ||
    '';
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  const toggleUserSettings = () => {
    setUserSettingsOpen(!userSettingsOpen);
  };
  const [avaSettingsOpen, setAvaSettingsOpen] = React.useState(false);
  const toggleAvaSettings = () => {
    setAvaSettingsOpen(!avaSettingsOpen);
  };
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        height: 'calc(100vh - 12rem)',
      }}
    >
      <Tabs
        className="flex-grow flex flex-col"
        selectedIndex={tabIndex}
        onSelect={(index) => setTabIndex(index)}
      >
        <TabList className="m-2 border-b-2 border-solid border-dark text-acai-white flex">
          <Tab>Config</Tab>
          <Tab>Knowledge</Tab>
          <Tab>Logs</Tab>
        </TabList>

        <TabPanel>
          <span>
            <ExpansionPanel
              className="border-t-0"
              title="User Profile"
              onChange={toggleUserSettings}
              isOpened={userSettingsOpen}
              tabIndex={0}
              // onKeyDown={toggleSettings}
            >
              <span className="p-2">
                <UserProfile />
              </span>
            </ExpansionPanel>
            <ExpansionPanel
              className="border-t-0"
              title="AVA Settings"
              onChange={toggleAvaSettings}
              isOpened={avaSettingsOpen}
              tabIndex={0}
              // onKeyDown={toggleSettings}
            >
              {workspaceId && <ChatModelDropdown workspaceId={workspaceId} />}

              {workspaceId &&
                agentStateService.getSnapshot().context[workspaceId]
                  ?.agentMode === 'custom' && (
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
            <ExpansionPanel
              className="border-t-0"
              title="Access Config"
              onChange={toggleSettings}
              isOpened={settingsOpen}
              tabIndex={0}
              // onKeyDown={toggleSettings}
            >
              <span className="p-2">
                <TokenManager />
              </span>
            </ExpansionPanel>
          </span>
        </TabPanel>

        <TabPanel>
          {workspaceId && <KnowledgeUpload workspaceId={workspaceId} />}
        </TabPanel>
        <TabPanel>
          <NotificationCenter
            placeholder="A place for AI to ponder"
            secondaryFilter="agent-thought"
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Settings;
