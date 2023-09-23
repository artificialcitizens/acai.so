/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
  public: {
    directory: {
      'index.html': {
        file: {
          contents: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
  <link href="/src/index.css" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
</body>
</html>
`,
        },
      },
    },
  },
  src: {
    directory: {
      'index.tsx': {
        file: {
          contents: `
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

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
`,
        },
      },
      'App.tsx': {
        file: {
          contents: `
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="App bg-blue-500 text-white">
      <h1 className="text-4xl">Hello, world!</h1>
    </div>
  );
};

export default App;
`,
        },
      },
      'styles.css': {
        file: {
          contents: `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  color: black;
  background-color: white;
}

h1 {
  font-weight: 800;
  font-size: 1.5rem;
}
`,
        },
      },
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "react-ts-starter",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "@types/react": "^18.2",
    "@types/react-dom": "^18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "react-scripts": "^5.0.1",
    "typescript": "^5.0.2"
  },
  "browserslist": [
    "defaults"
  ]
}
`,
    },
  },
  'tsconfig.json': {
    file: {
      contents: `
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "ES2022"],
    "moduleResolution": "node",
    "target": "ES2022"
    "allowSyntheticDefaultImports": true
  }
}

`,
    },
  },
};
