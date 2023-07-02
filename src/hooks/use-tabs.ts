import { useState, useEffect } from 'react';
import { useLocalStorage, useLocalStorageString } from './use-local-storage';

interface TabProps {
  id: number;
  name: string;
  content: string;
}

export const useTabs = () => {
  const [tabs, setTabs] = useState<TabProps[]>([]);
  const [content, setContent, deleteContent, updateContent, getContent] = useLocalStorage('tiptap', {});
  const [activeTab, setActiveTab] = useLocalStorageString('active-tab', '0');

  const createTab = ({ id, title, content }: { id?: number; title?: string; content?: string }) => {
    const newTabTitle = title || window.prompt('Please enter the title for the new tab');
    if (newTabTitle) {
      const newTab: TabProps = {
        id: id || Date.now(),
        name: newTabTitle,
        content: content || '',
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

  return { tabs, activeTab, createTab, deleteTab, updateContent, setActiveTab };
};
