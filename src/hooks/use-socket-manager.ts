import { useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  toastifyAgentLog,
  toastifyError,
  toastifyInfo,
} from '../components/Toast';
import { handleCreateDoc } from '../state';
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utils/config';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../context/GlobalStateContext';

export const useSocketManager = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const serverUrl =
    getToken('CUSTOM_SERVER_URL') || import.meta.env.VITE_CUSTOM_SERVER_URL;
  const serverPassword =
    getToken('CUSTOM_SERVER_PASSWORD') ||
    import.meta.env.VITE_CUSTOM_SERVER_PASSWORD;

  const workspaceId = rawWorkspaceId || 'docs';
  const navigate = useNavigate();

  useEffect(() => {
    handleConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    if (!serverUrl) return;
    const newSocket = io(serverUrl, {
      auth: {
        password: serverPassword,
      },
      autoConnect: false,
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection Failed', err);
      if (err.message.includes('xhr poll error')) {
        toastifyError('Connection failed, be sure that your server is running');
      } else {
        toastifyError('Connection failed: ' + err.message);
      }
      newSocket.close();
    });
    console.log('Connecting...');

    newSocket.connect();
    setSocket(newSocket);
  };

  const handleConnectCb = () => {
    if (!socket) return;
    toastifyInfo('Connected to server');
    console.log(`Connected: ${socket.id}`);
  };

  const handleDisconnect = () => {
    if (!socket) return;

    console.log(`Disconnected: ${socket.id}`);
  };

  const handleTab = async (data: { title: string; content: string }) => {
    if (!workspaceId) toastifyError('No workspace active');
    const { title, content } = data;
    const tab = await handleCreateDoc({ title, content }, workspaceId);
    globalServices.appStateService.send({
      type: 'ADD_DOC',
      doc: tab,
    });
    setTimeout(() => {
      navigate(`/${workspaceId}/documents/${tab.id}`);
    }, 250);
  };

  const handleHumanInTheLoop = (data: { question: string }) => {
    if (!socket) return;
    const response = window.prompt(data.question);
    if (response) {
      toastifyInfo(`Sending response to server ${response}`);
      socket?.emit('human-in-the-loop-response', response);
    } else {
      socket?.emit('human-in-the-loop-response', 'The user did not respond');
    }
  };
  const events = [
    { name: 'connect', handler: handleConnectCb },
    { name: 'disconnect', handler: handleDisconnect },
    { name: 'create-tab', handler: handleTab },
    {
      name: 'error',
      handler: (err: any) => {
        console.error(err);
        toastifyError(err.message);
      },
    },
    {
      name: 'agent-log',
      handler: (data: string) => {
        toastifyAgentLog(data);
      },
    },
    {
      name: 'crew-log',
      handler: (data: string) => {
        toastifyAgentLog(data);
      },
    },
    {
      name: 'info-toast',
      handler: (data: { info: string }) => {
        console.log(data.info);
        toastifyInfo(data.info);
      },
    },
    {
      name: 'human-in-the-loop',
      handler: handleHumanInTheLoop,
    },
  ];

  useEffect(() => {
    if (!socket) return;

    events.forEach((event) => {
      socket.on(event.name, event.handler);
    });

    return () => {
      events.forEach((event) => {
        socket.off(event.name, event.handler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  function disconnectSocket(socket: Socket) {
    events.forEach((event) => {
      socket.off(event.name);
    });

    socket.disconnect();
  }

  return { socket, disconnectSocket };
};
