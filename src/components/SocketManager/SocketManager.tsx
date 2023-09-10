import React, { useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';
import { toastifyAgentLog, toastifyError, toastifyInfo } from '../Toast';
import { handleCreateTab } from '../../state';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import SocketContext from '../../context/SocketContext';

export const SocketManager: React.FC = () => {
  const [storedUrl, setStoredUrl] = useLocalStorageKeyValue(
    'CUSTOM_AGENT_URL',
    '',
  );
  const [storedPassword, setStoredPassword] = useLocalStorageKeyValue(
    'CUSTOM_AGENT_SERVER_PASSWORD',
    '',
  );
  const [url, setUrl] = useState(storedUrl);
  const [password, setPassword] = useState(storedPassword);
  const [socket, setSocket] = useState<Socket | null>(null);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const navigate = useNavigate();
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);

  useEffect(() => {
    setUrl(storedUrl);
    setPassword(storedPassword);
  }, [storedUrl, storedPassword]);

  useEffect(() => {
    if (!storedUrl) return;
    handleConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUrl]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStoredUrl(url);
    setStoredPassword(password);
    handleConnect();
  };

  const handleConnect = () => {
    const newSocket = io(storedUrl, {
      auth: {
        password: storedPassword,
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
      toastifyInfo('Connected to custom agent');
      console.log(`Connected: ${socket.id}`);
    };
    const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);
    const handleTab = async (data: { title: string; content: string }) => {
      if (!workspaceId) toastifyError('No workspace active');
      const { title, content } = data;
      const tab = await handleCreateTab({ title, content }, workspaceId);
      globalServices.appStateService.send({
        type: 'ADD_TAB',
        tab,
      });
      setTimeout(() => {
        navigate(`/${workspaceId}/${tab.id}`);
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
    socket.on('info-toast', (err: any) => {
      console.error(err);
      toastifyInfo(err.message);
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

  return (
    <SocketContext.Provider value={socket}>
      <form onSubmit={handleFormSubmit}>
        <span className="flex mb-2 items-center">
          <label htmlFor="url" className="text-acai-white pr-2 w-[50%]">
            URL:
          </label>
          <input
            id="url"
            className="text-acai-white bg-base px-[2px]"
            type="password"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </span>
        <span className="flex mb-2 items-center">
          <label htmlFor="password" className="text-acai-white pr-2 w-[50%]">
            Password:
          </label>
          <input
            className="text-acai-white bg-base px-[2px]"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </span>
        <input
          type="submit"
          value="Connect"
          className="bg-neutral-900 text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-light focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        />
      </form>
    </SocketContext.Provider>
  );
};
