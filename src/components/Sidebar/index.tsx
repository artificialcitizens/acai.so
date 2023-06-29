import React, { useState } from 'react';
import { ExpansionPanel, Sidebar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import NotificationCenter from '../NotificationCenter';
import Chat from '../Chat/Chat';
import { avaChat } from '../Chat/chat-routes';
import SBSearch from '../Search';
import './Sidebar.css';

export interface SBSidebarProps {
  children: React.ReactNode;
}

const SBSidebar: React.FC<SBSidebarProps> = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(true);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <Sidebar position="right" className="max-h-full">
      <SBSearch />
      <ExpansionPanel title="Settings">
        <ExpansionPanel title="Stuff"></ExpansionPanel>
      </ExpansionPanel>
      <ExpansionPanel title="Notifications">
        <NotificationCenter />
      </ExpansionPanel>
      <ExpansionPanel className="flex-grow" title="Chat" isOpened={chatOpen} onChange={toggleChat}>
        <Chat name="Ava" avatar=".." onSubmitHandler={async (message) => avaChat(message)} />
      </ExpansionPanel>
    </Sidebar>
  );
};

export default SBSidebar;
