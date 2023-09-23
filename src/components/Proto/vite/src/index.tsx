import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const appElement = document.getElementById('app');

if (!appElement) {
  throw new Error("No element with id 'app' found");
}

const root = createRoot(appElement);

root.render(
  <StrictMode>
    <App name="Proto" />
  </StrictMode>,
);
