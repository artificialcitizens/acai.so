import React, { useLayoutEffect, useState } from 'react';
import { Sidebar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Sidebar.css';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';

interface SBSidebarProps {
  children: React.ReactNode;
}

const SBSidebar: React.FC<SBSidebarProps> = ({ children }) => {
  const [width, setWidth] = useState(30); // initia
  const [storedWidth, setStoredWidth] = useLocalStorageKeyValue(
    'AVA_PANEL_WIDTH',
    '30',
  );
  const [isResizing, setIsResizing] = useState(false);

  useLayoutEffect(() => {
    if (storedWidth) {
      setWidth(parseFloat(storedWidth));
    } else {
      setWidth(30);
    }
  }, [storedWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const initialX = e.clientX;
    const initialWidth = width;

    const handleMouseMove = (moveE: MouseEvent) => {
      const newWidth =
        initialWidth - ((moveE.clientX - initialX) / window.innerWidth) * 100;

      setWidth(Math.max(Math.min(newWidth, 50), 25)); // enforce min and max width
      setStoredWidth(Math.max(Math.min(newWidth, 50), 25).toString());
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div>
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            cursor: 'ew-resize',
          }}
        />
      )}
      <Sidebar
        position="right"
        className={`rounded-lg max-h-screen border-r border border-dark`}
        style={{ width: `${width}vw` }}
      >
        <div
          role="slider"
          aria-valuemin={25}
          aria-valuemax={50}
          aria-valuenow={width}
          tabIndex={0}
          style={{
            width: '10px',
            cursor: 'ew-resize',
            position: 'absolute',
            height: '100%',
          }}
          onMouseDown={handleMouseDown}
        />
        {children}
      </Sidebar>
    </div>
  );
};

export default SBSidebar;
