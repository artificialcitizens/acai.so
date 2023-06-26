import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
  children: React.ReactNode;
}
const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* <button onClick={toggleSidebar} className={`absolute top-6 ${'right-8'} rounded-full py-2 px-3 z-[1000]`}>
        {isSidebarOpen ? '🙈' : '👐'}
      </button> */}

      <div className={`chat-sidebar border-l-2 border-solid border-default ${isSidebarOpen ? 'open' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default Sidebar;
