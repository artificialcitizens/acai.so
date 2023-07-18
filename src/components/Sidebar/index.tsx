import React from 'react';
import { Sidebar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Sidebar.css';

export interface SBSidebarProps {
  children: React.ReactNode;
}

const SBSidebar: React.FC<SBSidebarProps> = ({ children }) => {
  return (
    <Sidebar position="right" className="w-[30vw] rounded-lg h-screen flex-shrink-0">
      {children}
    </Sidebar>
  );
};

export default SBSidebar;
