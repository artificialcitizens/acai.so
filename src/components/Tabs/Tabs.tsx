import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';

interface TabManagerProps {
  tabs: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  createTab: (tab: any) => void;
  deleteTab: (id: number) => void;
  updateContent: (id: string, content: any) => void;
}

const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  createTab,
  deleteTab,
  updateContent,
}) => {
  return (
    <Tabs
      className="flex-grow pr-2"
      selectedIndex={parseInt(activeTab, 10)}
      onSelect={(index) => {
        if (parseInt(activeTab, 10) !== index) {
          const currentTab = tabs[parseInt(activeTab, 10)];
          if (currentTab && !currentTab.content.trim()) {
            deleteTab(currentTab.id);
          }
        }
        setActiveTab(index.toString());
      }}
    >
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.id}>{tab.name}</Tab>
        ))}
        <Tab onClick={() => createTab({ id: Date.now() })}>+</Tab>
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.id}>
          <TipTap id={tab.id.toString()} title={tab.name} content={tab.content} updateContent={updateContent} />
        </TabPanel>
      ))}
      <TabPanel>
        <p>Create a new panel by selecting the + button</p>
      </TabPanel>
    </Tabs>
  );
};

export default TabManager;
