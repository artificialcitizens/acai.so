import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import { useLocalStorage, useLocalStorageString } from '../../hooks/use-local-storage';

interface TabProps {
  id: number;
  name: string;
  content: string;
}

const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabProps[]>([]);
  const [content, setContent, deleteContent, updateContent, getContent] = useLocalStorage('tiptap', {});
  const [activeTab, setActiveTab] = useLocalStorageString('active-tab', '0');

  const createTab = (title?: string) => {
    const newTabTitle = title || window.prompt('Please enter the title for the new tab');
    if (newTabTitle) {
      const newTab: TabProps = {
        id: Date.now(),
        name: newTabTitle,
        content: '',
      };
      updateContent(newTab.id.toString(), {
        title: newTab.name,
        content: newTab.content,
      });
      setTabs((prevTabsState) => {
        const newTabs = [...prevTabsState, newTab];
        setActiveTab((newTabs.length - 1).toString()); // Set active tab to new tab
        return newTabs;
      });
    }
  };

  const deleteTab = (id: number) => {
    deleteContent(id.toString());
    setTabs(tabs.filter((tab) => tab.id !== id));
  };

  useEffect(() => {
    const initialTabs: TabProps[] = Object.keys(content).map((key) => {
      const tabContent = content[key];
      return {
        id: parseInt(key, 10),
        name: tabContent.title,
        content: tabContent.content,
      };
    });
    setTabs(initialTabs);
  }, [content]);

  return (
    <Tabs
      className="flex-grow pr-2"
      selectedIndex={parseInt(activeTab, 10)} // Convert activeTab to a number
      onSelect={(index) => {
        if (parseInt(activeTab, 10) !== index) {
          const currentTab = tabs[parseInt(activeTab, 10)];
          if (currentTab && !currentTab.content.trim()) {
            deleteTab(currentTab.id);
          }
        }
        setActiveTab(index.toString()); // Convert index to a string and save in localStorage
      }}
    >
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.id}>{tab.name}</Tab>
        ))}
        <Tab onClick={() => createTab()}>+</Tab>
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.id}>
          <TipTap id={tab.id.toString()} title={tab.name} content={tab.content} updateContent={updateContent} />
        </TabPanel>
      ))}
      <TabPanel></TabPanel>
    </Tabs>
  );
};

export default TabManager;
