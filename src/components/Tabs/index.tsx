import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';

interface TabProps {
  id: number;
  name: string;
  content: string;
}

const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabProps[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  const createTab = () => {
    const newTab: TabProps = {
      id: tabs.length + 1,
      name: `Tab ${tabs.length + 1}`,
      content: `Content for Tab ${tabs.length + 1}`,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const deleteTab = (id: number) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleContentChange = (id: number, newContent: string | null) => {
    if (newContent === null) {
      deleteTab(id);
    } else {
      setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, content: newContent } : tab)));
    }
  };

  useEffect(() => {
    const initialTabs: TabProps[] = [{ id: 1, name: 'Tab 1', content: 'Content for Tab 1' }];
    setTabs(initialTabs);
    setActiveTab(initialTabs[0].id);
  }, []);

  return (
    <Tabs className="flex-grow" selectedIndex={activeTab - 1} onSelect={(index) => setActiveTab(index + 1)}>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.id}>{tab.name}</Tab>
        ))}
        <Tab onClick={createTab}>+</Tab>
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.id}>
          <TipTap
            startingValue={tab.content}
            onClickHandler={(newContent) => handleContentChange(tab.id, newContent)}
            label={tab.name}
            id={tab.id}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default TabManager;
