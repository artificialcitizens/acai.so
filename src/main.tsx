import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import io from 'socket.io-client';
import SocketContext from './SocketContext';
import { HotKeys } from 'react-hotkeys';
const socket = io('http://localhost:3000', {
  auth: {
    password: 'your_password_here',
  },
});
const keyMap = {
  SNAP_LEFT: 'command+left',
};
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HotKeys keyMap={keyMap}>
      <SocketContext.Provider value={socket}>
        <App />
      </SocketContext.Provider>
    </HotKeys>
  </React.StrictMode>,
);
