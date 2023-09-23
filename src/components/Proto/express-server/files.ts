/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
  'index.js': {
    file: {
      contents: `
import express from 'express';
import axios from 'axios';

const app = express();
const port = 3111;

app.get('/', async (req, res) => {
  try {
    const url = 'https://www.joshmabry.dev'; // replace with your URL
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('An error occurred while fetching the URL');
  }
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest",
    "axios": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`,
    },
  },
};
