import React, { useState } from 'react';
import { ExpansionPanel, Sidebar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import NotificationCenter from '../NotificationCenter';
import Chat from '../Chat/Chat';
import { avaChat } from '../Chat/chat-routes';
import SBSearch from '../Search';
import ScratchPad from '../ScratchPad/ScratchPad';
import './Sidebar.css';

export interface SBSidebarProps {
  children: React.ReactNode;
}

const SBSidebar: React.FC<SBSidebarProps> = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(true);
  const [agentThoughtsOpen, setAgentThoughtsOpen] = useState(true);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const toggleAgentThoughts = () => {
    setAgentThoughtsOpen(!agentThoughtsOpen);
  };

  return (
    <Sidebar position="right" className="w-[33vw] rounded-lg overflow-hidden flex-shrink-0">
      <ExpansionPanel title="Settings">{children}</ExpansionPanel>
      <ExpansionPanel title="Search">
        <SBSearch />
      </ExpansionPanel>
      <ExpansionPanel title="Notes">
        <ScratchPad id="Notes" />
      </ExpansionPanel>
      <ExpansionPanel title="Notifications" isOpened={notificationsOpen} onChange={toggleNotifications}>
        <NotificationCenter placeholder="Nothing to see here 👀" />
      </ExpansionPanel>
      <ExpansionPanel title="Agent Thoughts" isOpened={agentThoughtsOpen} onChange={toggleAgentThoughts}>
        <NotificationCenter placeholder="A place for AI to ponder" secondaryFilter="agent-thought" />
      </ExpansionPanel>
      <ExpansionPanel className="flex-grow" title="Chat" isOpened={chatOpen} onChange={toggleChat}>
        <Chat name="Ava" avatar=".." onSubmitHandler={async (message) => avaChat(message)} />
      </ExpansionPanel>
    </Sidebar>
  );
};

export default SBSidebar;
