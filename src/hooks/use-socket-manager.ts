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
import { useCrewAi } from '../components/CrewAI/use-crew-ai';
import { useImportWorkspace } from './use-import-workspace';

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
  const { addLogsToCrew } = useCrewAi();
  const { syncData } = useImportWorkspace();
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
      socket.emit('human-in-the-loop-response', response);
    } else {
      socket.emit('human-in-the-loop-response', 'The user did not respond');
    }
  };

  const handleUpdateData = async (data: any) => {
    // Example: Update your application's local state or UI based on the received data
    // This could involve checking if the data is new, if it needs to replace existing data, etc.
    console.log('Data received from server:', data);
    await syncData(data);
    // Example action: Direct update or a function call to handle the data
    // updateLocalState(data);

    // If the data contains identifiable documents or entries, you can also route or perform specific actions
    // For instance, if data has an 'id', you might want to navigate to that document's view/page:
    // if (data.id) navigate(`/${workspaceId}/documents/${data.id}`);
  };

  const events = [
    { name: 'connect', handler: handleConnectCb },
    { name: 'disconnect', handler: handleDisconnect },
    { name: 'create-tab', handler: handleTab },
    {
      name: 'update_data',
      handler: handleUpdateData, // The new event handler for "update_data"
    },
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
      name: 'info-toast',
      handler: (data: { info: string }) => {
        console.log(data.info);
        toastifyInfo(data.info);
      },
    },
    {
      name: 'crew-log',
      handler: (data: { log: string }) => {
        const jsonData = JSON.parse(data.log);
        const { id, timestamp, agent, task, output, context, tools } = jsonData;
        toastifyInfo(`${agent} finished the task: ${task}`);
        addLogsToCrew(jsonData);
      },
    },
    {
      name: 'human-in-the-loop',
      handler: handleHumanInTheLoop,
    },
  ];

  const handleSyncData = (data: any) => {
    if (!socket) return;

    const latestTimestamp = new Date().toISOString();

    socket.emit('sync_data', {
      id: data.id,
      latest_timestamp: latestTimestamp,
    });
  };

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

  return { socket, disconnectSocket, handleSyncData };
};
