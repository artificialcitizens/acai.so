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
    // notify the user with alert and prompt
    const name = prompt('Enter a name for the new tab');
    const newTab = {
      id: Date.now().toString(),
      name: name,
      content: '',
      workspaceId: activeWorkspaceId,
    };
    service.send({ type: 'ADD_TAB', tab: newTab });
  };

  // const handleDeleteTab = (id: string) => {
  //   service.send({ type: 'DELETE_TAB', id });
  // };

  // const handleUpdateContent = (id: string, content: any) => {
  //   const updatedTab = { id, content, workspaceId: activeWorkspaceId };
  //   service.send({ type: 'UPDATE_TAB_CONTENT', ...updatedTab });
  // };

  const workspace = service.getSnapshot().context.workspaces.filter((ws) => ws.id === activeWorkspaceId)[0];

  return (
    activeWorkspaceId && (
      <Tabs
        key={activeWorkspaceId}
        className="flex-grow pr-2"
        selectedIndex={activeTab}
        onSelect={(index) => {
          if (activeTab !== index) {
            const currentTab = workspace.data.tiptap.tabs[activeTab];
            // if (currentTab) {
            //   handleDeleteTab(currentTab.id);
            // }
          }
          setActiveTab(index);
        }}
      >
        <TabList>
          {workspace.data.tiptap.tabs.map((tab) => (
            <Tab key={tab.id}>{tab.name}</Tab>
          ))}
          <Tab onClick={handleCreateTab}>+</Tab>
        </TabList>
        {workspace.data.tiptap.tabs.map((tab) => (
          <TabPanel key={tab.id}>
            <TipTap id={tab.id.toString()} title={tab.name} content={tab.content} updateContent={() => console.log()} />
          </TabPanel>
        ))}
        <TabPanel>
          <p>Create a new panel by selecting the + button</p>
        </TabPanel>
      </Tabs>
    )
  );
};

export default TabManager;
