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
import AudioSettings from './AudioSettings';

interface SettingsProps {
  initialTabIndex?: number;
}

const Settings: React.FC<SettingsProps> = ({
  initialTabIndex = 0,
}: SettingsProps) => {
  const [tabIndex, setTabIndex] = React.useState(initialTabIndex);

  const [settingsOpen, setSettingsOpen] = React.useState(true);
  const [userSettingsOpen, setUserSettingsOpen] = React.useState(true);
  const { workspaceId } = useParams<{
    workspaceId: string;
    domain: 'knowledge' | 'documents' | undefined;
    id: string;
  }>();

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  const toggleUserSettings = () => {
    setUserSettingsOpen(!userSettingsOpen);
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
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
