import express from 'express';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { avaChat } from './ava.js';
import axios from 'axios';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://www.acai.so'],
    credentials: true,
  }),
);

app.get('/test', (_, res) => {
  res.send('Hello world');
});

interface AgentPayload {
  userMessage: string;
  userName: string;
  userLocation: string;
  customPrompt: string; // Replace 'any' with the actual type
  chatHistory: any; // Replace 'any' with the actual type
  currentDocument: string;
}

app.post('/v1/agent', async (req, res) => {
  try {
    const agentPayload: AgentPayload = req.body;
    const {
      userMessage,
      userName,
      userLocation,
      customPrompt,
      chatHistory,
      currentDocument,
    } = agentPayload;
    console.log('User Message:', userMessage);
    console.log('User Name:', userName);
    console.log('User Location:', userLocation);
    console.log('Custom Prompt:', customPrompt);
    console.log('Chat History:', chatHistory);
    console.log('Current Document:', currentDocument);
    res.status(200).send({ message: 'Payload received and logged' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while processing the payload' });
  }
});

app.get('/ava', async (req, res) => {
  const { query } = req.query as {
    query: string;
  };
  const callbacks = {
    onDataReceived: (data: any) => {
      io.emit('data-received', data);
    },
    onAgentAction: (data: any) => {
      io.emit('agent-action', data);
    },
    onProcessing: (data: any) => {
      io.emit('processing', data);
    },
    onError: (error: any) => {
      io.emit('error', error);
    },
    onCreateDocument: (data: any) => {
      const title = data
        .split('Title: ')[1]
        .split(', Content:')[0]
        .replace(/"/g, '');
      const content = data.split(', Content: ')[1].replace(/"/g, '');
      io.emit('create-tab', {
        title,
        content,
      });
    },
  };
  try {
    const response = await avaChat(query, callbacks);
    res.send(response);
  } catch (error: any) {
    console.log(error);
    io.emit('error', error.message);
    res.send('I had an issue parsing the last message, please try again');
  }
});

app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url as string;
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error: any) {
    res.status(500).send({ error: error.toString() });
  }
});

const httpServer = createServer(app);

// Use the correct options for creating the socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://www.acai.so'],
    methods: ['GET', 'POST'], // Add this line
    credentials: true, // Add this line if you want to allow credentials
  },
});

const authenticate = (socket: Socket, next: (_err?: Error) => void) => {
  const password = socket.handshake.auth.password;
  // @TODO - set to use payload authentication
  if (password === 'your_password_here') {
    console.log('Authenticated');
    return next();
  }

  next(new Error('Authentication error'));
};

io.use(authenticate);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const start = async () => {
  httpServer.listen(3000);
  console.log('Server listening on port 3000');
};

start();
