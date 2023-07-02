import React, { useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import { useTabs } from '../../hooks/use-tabs';

const TabManager: React.FC = () => {
  const { tabs, activeTab, createTab, deleteTab, updateContent, setActiveTab } = useTabs();
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
        <p>You real sunuva bish</p>
      </TabPanel>
    </Tabs>
  );
};

export default TabManager;
