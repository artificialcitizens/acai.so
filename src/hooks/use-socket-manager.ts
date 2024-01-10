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

/**
 * @TODO: Update to manage socket events in a more generic way
 */
export const useSocketManager = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const serverUrl = getToken('CUSTOM_SERVER_URL') || '';
  const serverPassword = getToken('CUSTOM_SERVER_PASSWORD') || '';

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

  useEffect(() => {
    if (!socket) return;

    const handleConnectCb = () => {
      toastifyInfo('Connected to server');
      console.log(`Connected: ${socket.id}`);
    };

    const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);

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
    socket.on('connect', handleConnectCb);
    socket.on('disconnect', handleDisconnect);
    socket.on('create-tab', handleTab);
    socket.on('error', (err: any) => {
      console.error(err);
      toastifyError(err.message);
    });
    socket.on('agent-log', (data: string) => {
      toastifyAgentLog(data);
    });
    socket.on('info-toast', (data: { info: string }) => {
      console.log(data.info);
      toastifyInfo(data.info);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('create-tab', handleTab);
      socket.off('error', (err: any) => {
        console.error(err);
        toastifyError(err.message);
      });
      socket.off('agent-log', (data: string) => {
        toastifyAgentLog(data);
      });
      socket.off('info-toast', (err: any) => {
        console.error(err);
        toastifyInfo(err.message);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  function disconnectSocket(socket: Socket) {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('create-tab');
    socket.off('error');
    socket.off('agent-log');
    socket.off('info-toast');

    socket.disconnect();
  }

  return { socket, disconnectSocket };
};
