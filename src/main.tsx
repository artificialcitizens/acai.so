import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import { HotKeys } from 'react-hotkeys';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';
import LandingPage from './components/LandingPage/LandingPage';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <HotKeys keyMap={keyMap}> */}
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:workspaceId/:tabId" element={<App />} />
          <Route path="knowledge/:workspaceId/:knowledgeId" element={<App />} />
          {/* update with proper 404 with links to docs */}
          <Route path="*" element={<App />} />
        </Routes>
      </Router>
    </GlobalStateProvider>
    {/* </HotKeys> */}
  </React.StrictMode>,
);
