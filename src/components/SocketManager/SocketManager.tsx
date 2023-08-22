import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';
import { toastifyError } from '../Toast';

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

    const handleConnect = () => console.log(`Connected: ${socket.id}`);
    const handleMessage = (message: string) => console.log(message);
    const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);

    socket.on('connect', handleConnect);
    socket.on('message', handleMessage);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessage);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return (
    <form onSubmit={handleSubmit}>
      <span className="flex mb-2 items-center">
        <label htmlFor="url" className="text-acai-white pr-2 w-[50%]">
          URL:
        </label>
        <input
          id="url"
          className="text-acai-white px-[2px]"
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
          className="text-acai-white px-[2px]"
          id="password"
          type="password"
          value={storedPassword}
          onChange={(e) => setStoredPassword(e.target.value)}
        />
      </span>
      <input
        type="submit"
        value="Connect"
        className="bg-transparent text-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-light focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
      />
    </form>
  );
};
// old socket code
// const socket = useContext(SocketContext);

// useEffect(() => {
//   if (!socket) return;

//   const handleConnect = () => console.log(`Connected: ${socket.id}`);
//   const handleMessage = (message: string) => console.log(message);
//   const handleDisconnect = () => console.log(`Disconnected: ${socket.id}`);

//   // const handleAgentObservation = (observation: { content: string }) => {
//   //   // setCurrentTool(observation.content);
//   //   // const thought = observation.log.split('Observation:')[0].trim();
//   //   toastifyAgentObservation(observation.content);
//   // };

//   socket.on('connect', handleConnect);
//   socket.on('message', handleMessage);
//   socket.on('disconnect', handleDisconnect);
//   socket.on('create-tab', (data) =>
//     handleCreateTab({ title: data.title, content: data.content }, send, workspace.id),
//   );

//   return () => {
//     socket.off('connect', handleConnect);
//     socket.off('message', handleMessage);
//     socket.off('disconnect', handleDisconnect);
//     socket.off('create-tab', (data) =>
//       handleCreateTab({ title: data.title, content: data.content }, send, workspace.id),
//     );
//   };

//   // HERE IS HOW TO USE TOOLS VIA SOCKET BY HAVING THE TOOL SEND THE ACTION THROUGH SOCKET
//   // socket.on('agent-action', (action: string) => {
//   //   console.log('agent-action', action);
//   //   if (action === 'start-listening') {
//   //     setAvaListening(true);
//   //   } else if (action === 'stop-listening') {
//   //     setAvaListening(false);
//   //   }
//   // });
// }, [send, socket, workspace]); // specify the dependencies here
