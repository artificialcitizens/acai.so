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
  const [chatOpen, setChatOpen] = useState(true);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <Sidebar position="right">
      <ExpansionPanel title="Notifications">
        <NotificationCenter />
      </ExpansionPanel>
      <ExpansionPanel title="Options"></ExpansionPanel>
      <ExpansionPanel title="Chat" isOpened={chatOpen} onChange={toggleChat}>
        <Chat name="Ava" avatar=".." onSubmitHandler={async (message) => avaChat(message)} />
      </ExpansionPanel>
    </Sidebar>
  );
};

export default SBSidebar;
