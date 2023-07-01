import React from 'react';
import { Socket } from 'socket.io-client';

const SocketContext = React.createContext<Socket | null>(null);

export default SocketContext;
