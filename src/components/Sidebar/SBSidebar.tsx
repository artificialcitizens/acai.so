import React, { useState, useEffect } from 'react';
import { Sidebar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './Sidebar.css';
import { ToggleView } from '../ToggleView/ToggleView';

interface SBSidebarProps {
  children: React.ReactNode;
}

const SBSidebar: React.FC<SBSidebarProps> = ({ children }) => {
  const calculatedWidth = window.innerWidth < 640 ? 100 : 50;
  const minWidth = 0;
  const defaultWidth = calculatedWidth;
  const [width, setWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [toggled, setToggled] = useState(true);

  const toggleView = () => {
    setToggled(!toggled);
    if (toggled) {
      setWidth(0);
    } else {
      setWidth(defaultWidth);
    }
  };

  useEffect(() => {
    const storedWidth = localStorage.getItem('AVA_PANEL_WIDTH');
    if (storedWidth) {
      setWidth(parseFloat(storedWidth));
    } else {
      setWidth(defaultWidth);
    }
  }, [defaultWidth]);

  useEffect(() => {
    if (width !== null) {
      localStorage.setItem('AVA_PANEL_WIDTH', width.toString());
      if (width === 0) {
        setToggled(false);
      } else {
        setToggled(true);
      }
    }
  }, [width]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const initialX = e.clientX;
    const initialWidth = width;

    const handleMouseMove = (moveE: MouseEvent) => {
      if (initialWidth !== null) {
        const newWidth =
          initialWidth - ((moveE.clientX - initialX) / window.innerWidth) * 100;

        setWidth(Math.max(Math.min(newWidth, 100), minWidth));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (width === null) return <></>;

  return (
    <>
      {isResizing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            cursor: 'ew-resize',
            zIndex: 10000,
          }}
        />
      )}
      <ToggleView
        toggled={toggled}
        handleClick={(e) => {
          e.stopPropagation();
          toggleView();
        }}
      />
      <Sidebar
        position="right"
        className={`right-0 fixed md:relative max-h-screen transition-transform`}
        style={{
          width: `${width}vw`,
        }}
      >
        <div
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={width}
          tabIndex={0}
          className="md:hover:bg-acai-darker"
          style={{
            width: width < 3 ? '20px' : '10px',
            cursor: 'ew-resize',
            position: 'absolute',
            height: '100%',
            backgroundColor: width < 3 ? '#2f2f2f' : '',
          }}
          onMouseDown={handleMouseDown}
        />
        {}
        {children}
      </Sidebar>
    </>
  );
};

export default SBSidebar;
