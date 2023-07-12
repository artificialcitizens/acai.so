import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useInterpret } from '@xstate/react';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import { appStateMachine } from '../../machines/app.xstate'; // Import your state machine

interface TabManagerProps {
  tabs: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabManager: React.FC<TabManagerProps> = ({ tabs, activeTab, setActiveTab }) => {
  const service = useInterpret(appStateMachine);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  useEffect(() => {
    service.onTransition((state) => {
      if (state.context.workspaces) {
        setCurrentWorkspace(state.context.workspaces.find((workspace) => workspace.id === 'UUIDxyz'));
      }
    });
  }, [service]);
  console.log('currentWorkspace', currentWorkspace);
  const handleCreateTab = () => {
    const newTab = { id: Date.now(), name: 'New Tab', content: '' };
    service.send({ type: 'ADD_TAB', tab: newTab }); // Replace with your actual event type and payload
  };

  const handleDeleteTab = (id: number) => {
    service.send({ type: 'DELETE_TAB', id }); // Replace with your actual event type and payload
  };

  const handleUpdateContent = (id: string, content: any) => {
    service.send({ type: 'UPDATE_TAB_CONTENT', id, content }); // Replace with your actual event type and payload
  };

  return (
    currentWorkspace && (
      <Tabs
        className="flex-grow pr-2"
        selectedIndex={parseInt(activeTab, 10)}
        onSelect={(index) => {
          if (parseInt(activeTab, 10) !== index) {
            const currentTab = tabs[parseInt(activeTab, 10)];
            if (currentTab && !currentTab.content.trim()) {
              handleDeleteTab(currentTab.id);
            }
          }
          setActiveTab(index.toString());
        }}
      >
        <TabList>
          {currentWorkspace.data.tiptap.tabs.map((tab) => (
            <Tab key={tab.id}>{tab.name}</Tab>
          ))}
          <Tab onClick={handleCreateTab}>+</Tab>
        </TabList>
        {currentWorkspace.data.tiptap.tabs.map((tab) => (
          <TabPanel key={tab.id}>
            <TipTap id={tab.id.toString()} title={tab.name} content={tab.content} updateContent={handleUpdateContent} />
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
