import React, { useState } from 'react';
import { ExpansionPanel, Sidebar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import NotificationCenter from '../NotificationCenter';
import Chat from '../Chat/Chat';
import { avaChat } from '../Chat/chat-routes';

export interface SBSidebarProps {
  children: React.ReactNode;
}

const SBSidebar: React.FC<SBSidebarProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Sidebar position="right">
      <ExpansionPanel title="Notifications">
        <NotificationCenter />
      </ExpansionPanel>
      <ExpansionPanel title="Options"></ExpansionPanel>
      <ExpansionPanel title="Chat" isOpened>
        <Chat name="Ava" avatar=".." onSubmitHandler={async (message) => avaChat(message)} />
      </ExpansionPanel>
    </Sidebar>
  );
};

export default SBSidebar;
