import { useState, useEffect } from 'react';
import { useLocalStorage, useLocalStorageString } from './use-local-storage';

interface TabProps {
  id: number;
  title: string;
  content: string;
}

export const useTabs = () => {
  const [content, setContent, deleteContent, updateContent, getContent] = useLocalStorage('tiptap', {});
  const [activeTab, setActiveTab] = useLocalStorageString('active-tab', '0');

  const tabs = Object.keys(content).map((key) => {
    const tabContent = content[key];
    return {
      id: parseInt(key, 10),
      name: tabContent.title,
      content: tabContent.content,
    };
  });

  const createTab = ({ id, title, content }: { id?: number; title?: string; content?: string }) => {
    const newTabTitle = title || window.prompt('Please enter the title for the new tab');
    if (newTabTitle) {
      const newTab: TabProps = {
        id: id || Date.now(),
        title: newTabTitle,
        content: content || '',
      };
      updateContent(newTab.id.toString(), { title: newTab.name, content: newTab.content });
      setActiveTab(newTab.id.toString()); // Set active tab to new tab
    }
  };

  const deleteTab = (id: number) => {
    if (id.toString() === activeTab) {
      setActiveTab('0');
    }
    deleteContent(id.toString());
    const updatedContent = { ...content };
    delete updatedContent[id.toString()];
    setContent(updatedContent); // update the content state after deleting a tab
  };

  useEffect(() => {
    window.localStorage.setItem('active-tab', activeTab);
  }, [activeTab]);

  return { tabs, activeTab, createTab, deleteTab, updateContent, setActiveTab };
};
