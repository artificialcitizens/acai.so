import React, { useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';
import { toastifyError, toastifyInfo } from '../Toast';
import { handleCreateTab } from '../../state';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';

export const SocketManager: React.FC = () => {
  const [storedUrl, setStoredUrl] = useLocalStorageKeyValue(
    'CUSTOM_AGENT_URL',
    '',
  );
  const [storedPassword, setStoredPassword] = useLocalStorageKeyValue(
    'CUSTOM_AGENT_SERVER_PASSWORD',
    '',
  );
  const [socket, setSocket] = useState<Socket | null>(null);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const navigate = useNavigate();
  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newSocket = io(storedUrl, {
      auth: {
        password: storedPassword,
      },
      autoConnect: false, // Prevent automatic connection
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

    newSocket.connect();
    setSocket(newSocket);
  };

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      toastifyInfo('Connected to custom agent');
      console.log(`Connected: ${socket.id}`);
    };
    const handleMessage = (message: string) => console.log(message);
    const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);
    const handleTab = async (data: { title: string; content: string }) => {
      if (!workspaceId) toastifyError('No workspace active');
      const { title, content } = data;
      handleCreateTab({ title, content }, workspaceId);
      const tab = await handleCreateTab({ title, content }, workspaceId);
      globalServices.appStateService.send({
        type: 'ADD_TAB',
        tab,
      });
      setTimeout(() => {
        navigate(`/${workspaceId}/${tab.id}`);
      }, 250);
    };
    socket.on('connect', handleConnect);
    socket.on('message', handleMessage);
    socket.on('disconnect', handleDisconnect);
    socket.on('create-tab', handleTab);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessage);
      socket.off('disconnect', handleDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <form onSubmit={handleSubmit}>
      <span className="flex mb-2 items-center">
        <label htmlFor="url" className="text-acai-white pr-2 w-[50%]">
          URL:
        </label>
        <input
          id="url"
          className="text-acai-white bg-base px-[2px]"
          type="text"
          value={storedUrl}
          onChange={(e) => setStoredUrl(e.target.value)}
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
          value={storedPassword}
          onChange={(e) => setStoredPassword(e.target.value)}
        />
      </span>
      <input
        type="submit"
        value="Connect"
        className="bg-neutral-900 text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-light focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      />
    </form>
  );
};
