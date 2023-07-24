import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'tw-elements-react/dist/css/tw-elements-react.min.css';
import client from 'socket.io-client';
import SocketContext from './context/SocketContext';
import { HotKeys } from 'react-hotkeys';
import { VectorStoreContext } from './context/VectorStoreContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';

// const socket = client('http://localhost:3000', {
//   auth: {
//     password: 'your_password_here',
//   },
// });
const keyMap = {
  SNAP_LEFT: 'command+left',
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HotKeys keyMap={keyMap}>
      {/* <SocketContext.Provider value={socket}> */}
      <GlobalStateProvider>
        <Router>
          <App />
        </Router>
      </GlobalStateProvider>
      {/* </SocketContext.Provider> */}
    </HotKeys>
  </React.StrictMode>,
);
