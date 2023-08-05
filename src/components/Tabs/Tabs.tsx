import React, { useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useInterpret } from '@xstate/react';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import { appStateMachine } from '../../state/app.xstate';
import { v4 as uuidv4 } from 'uuid';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const TabManager: React.FC = () => {
  const service = useInterpret(appStateMachine);
  const navigate = useNavigate();
  const location = useLocation();
  const activeWorkspaceId = location.pathname.split('/')[1];
  const activeTabId = location.pathname.split('/')[2];

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
  const activeTab = workspace?.data.tiptap.tabs.find((tab) => tab.id === activeTabId);

  // Calculate the width for each tab
  const tabWidth = workspace?.data.tiptap.tabs.length
    ? `calc(100% / ${workspace.data.tiptap.tabs.length + 1})`
    : '100%';

  return (
    workspace && (
      <Tabs key={activeWorkspaceId} className="flex-grow">
        <TabList>
          {workspace.data.tiptap.tabs.map((tab) => (
            <Link
              key={tab.id}
              title={tab.title}
              className={`cursor-pointer p-2 self-center truncate h-full border rounded-t whitespace-nowrap overflow-hidden ${
                tab.id === activeTabId ? 'bg-base border-neutral-300' : 'border-neutral-600'
              }`}
              to={`/${workspace.id}/${tab.id}`}
              data-te-sidenav-link-ref
              style={{ maxWidth: tabWidth }}
            >
              <Tab className={`overflow-hidden`}>{tab.title}</Tab>
            </Link>
          ))}
          <Tab
            className="cursor-pointer border-none p-2 px-4 text-center"
            onClick={handleCreateTab}
            style={{ maxWidth: tabWidth }}
          >
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
