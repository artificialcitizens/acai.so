import React, { useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useInterpret } from '@xstate/react';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import { appStateMachine } from '../../machines/app.xstate';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';

interface TabManagerProps {
  activeWorkspaceId: string;
  activeTabId: string;
}

const TabManager: React.FC<TabManagerProps> = ({ activeWorkspaceId, activeTabId }) => {
  const service = useInterpret(appStateMachine);
  const [tabId, setTabId] = React.useState(activeTabId);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('activeTabId', activeTabId);
    setTabId(activeTabId);
  }, [activeTabId]);

  const handleCreateTab = () => {
    const title = prompt('Enter a title for the new tab');
    const newTab = {
      id: uuidv4().split('-')[0],
      title: title || 'New Tab',
      content: '',
      workspaceId: activeWorkspaceId,
    };
    service.send({ type: 'ADD_TAB', tab: newTab });

    // Update the URL to the new tab
    navigate(`/${activeWorkspaceId}/${newTab.id}`);
  };

  const workspace = service.getSnapshot().context.workspaces[activeWorkspaceId];

  // Find the current active tab
  const activeTab = workspace?.data.tiptap.tabs.find((tab) => tab.id === tabId);
  return (
    workspace && (
      <Tabs key={activeWorkspaceId} className="flex-grow">
        <TabList>
          {workspace.data.tiptap.tabs.map((tab) => (
            <Link
              key={tab.id}
              className={`cursor-pointer p-2 border truncate max-w-[25%] self-center h-full ${
                tab.id === activeTabId ? 'bg-light' : ''
              }`}
              to={`/${workspace.id}/${tab.id}`}
              data-te-sidenav-link-ref
            >
              <Tab className="">{tab.title}</Tab>
            </Link>
          ))}
          <Tab className="cursor-pointer border-none p-2 px-4 text-center" onClick={handleCreateTab}>
            +
          </Tab>
        </TabList>
        {workspace.data.tiptap.tabs.map((tab) => (
          <TabPanel key={tab.id}>{activeTab && <TipTap tab={activeTab} />}</TabPanel>
        ))}
        <TabPanel>
          <p>Create a new panel by selecting the + button</p>
        </TabPanel>
      </Tabs>
    )
  );
};

export default TabManager;
