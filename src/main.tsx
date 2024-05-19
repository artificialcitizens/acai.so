import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import { HotKeys } from 'react-hotkeys';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';
import LandingPage from './components/LandingPage/LandingPage';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <HotKeys keyMap={keyMap}> */}
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/proto" element={<App proto />} />
          <Route path="/:workspaceId/:domain/:id" element={<App />} />
          {/* update with proper 404 with links to docs */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </GlobalStateProvider>
    {/* </HotKeys> */}
  </React.StrictMode>,
);
