import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TipTap from '../TipTap/TipTap';
import 'react-tabs/style/react-tabs.css';
import './tabs.css';
import useLocalStorage from '../../hooks/use-local-storage';

interface TabProps {
  id: number;
  name: string;
  content: string;
}

const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<TabProps[]>([]);
  const [activeTab, setActiveTab] = useState<number>(-1);
  const [content, setContent, deleteContent, updateContent, getContent] = useLocalStorage('tiptap', {
    ['welcome']: {
      title: 'Welcome',
      content: 'Welcome to your Second Brain!',
    },
  });

  const createTab = () => {
    const title = window.prompt('Please enter the title for the new tab');
    if (title) {
      const newTab: TabProps = {
        id: Date.now(),
        name: title,
        content: `Content for ${title}`,
      };
      updateContent(newTab.id.toString(), {
        title: newTab.name,
        content: newTab.content,
      });
      setTabs((prevTabsState) => {
        const newTabs = [...prevTabsState, newTab];
        setActiveTab(newTabs.length - 1); // Set active tab to the last one
        return newTabs;
      });
    }
  };

  const deleteTab = (id: number) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    if (newTabs.length > 0) {
      setActiveTab(0);
    } else {
      setActiveTab(-1);
    }
    setTabs(newTabs);
  };

  useEffect(() => {
    setActiveTab(0);
  }, []);

  useEffect(() => {
    const initialTabs: TabProps[] = Object.keys(content).map((key) => {
      const tabContent = content[key];
      return {
        id: parseInt(key, 10), // assuming the keys in local storage are the ids
        name: tabContent.title,
        content: tabContent.content,
      };
    });
    setTabs(initialTabs);
  }, [content]);

  return (
    <Tabs className="flex-grow" selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.id}>{tab.name}</Tab>
        ))}
        <Tab onClick={createTab}>+</Tab>
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.id}>
          <TipTap
            // onClickHandler={(newContent) => handleContentChange(tab.id, newContent)}
            id={tab.id.toString()}
            title={tab.name}
            content={tab.content}
            updateContent={updateContent}
          />
        </TabPanel>
      ))}
      <TabPanel></TabPanel>
    </Tabs>
  );
};

export default TabManager;
