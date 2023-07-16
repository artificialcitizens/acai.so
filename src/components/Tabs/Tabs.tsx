import React, { useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useInterpret } from '@xstate/react';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import { appStateMachine } from '../../machines/app.xstate';

interface TabManagerProps {
  activeWorkspaceId: string;
  activeTab: number;
  setActiveTab: (activeTab: number) => void;
}

const TabManager: React.FC<TabManagerProps> = ({ activeWorkspaceId, activeTab, setActiveTab }) => {
  const service = useInterpret(appStateMachine);

  const handleCreateTab = () => {
    const title = prompt('Enter a title for the new tab');
    const newTab = {
      id: Date.now().toString(),
      title: title || 'New Tab',
      content: '',
      workspaceId: activeWorkspaceId,
    };
    service.send({ type: 'ADD_TAB', tab: newTab });
  };

  const workspace = service.getSnapshot().context.workspaces[activeWorkspaceId];
  if (!activeWorkspaceId) return null;
  return (
    <Tabs
      key={activeWorkspaceId}
      className="flex-grow"
      selectedIndex={activeTab}
      onSelect={(index) => {
        if (activeTab !== index) {
          const currentTab = workspace.data.tiptap.tabs[activeTab];
        }
        setActiveTab(index);
      }}
    >
      <TabList>
        {workspace.data.tiptap.tabs.map((tab) => (
          <Tab className="cursor-pointer p-2 border truncate max-w-[25%] self-center h-full" key={tab.id}>
            {tab.title}
          </Tab>
        ))}
        <Tab className="cursor-pointer border-none p-2 px-4 text-center" onClick={handleCreateTab}>
          +
        </Tab>
      </TabList>
      {workspace.data.tiptap.tabs.map((tab) => (
        <TabPanel key={tab.id}>
          <TipTap
            id={tab.id.toString()}
            title={tab.title}
            systemNote={tab.systemNote}
            content={tab.content}
            updateContent={() => console.log()}
          />
        </TabPanel>
      ))}
      <TabPanel>
        <p>Create a new panel by selecting the + button</p>
      </TabPanel>
    </Tabs>
  );
};

export default TabManager;
