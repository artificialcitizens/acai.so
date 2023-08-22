import React, { useState, useEffect, useContext } from 'react';
import { Socket } from 'socket.io-client';
import SocketContext from '../../context/SocketContext';

const RoomManager: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [joinRoomId, setJoinRoomId] = useState<string>('');
  const [data, setData] = useState<string>('');
  const socket = useContext(SocketContext);

  // Set up event listener for 'data-received' event immediately after socket connection is established
  useEffect(() => {
    if (!socket) return;

    if (!socket.hasListeners('data-received')) {
      const handleDataReceived = (data: string) => {
        console.log('Data received:', data);
        setData(data);
      };

      socket.on('data-received', handleDataReceived);

      return () => {
        socket.off('data-received', handleDataReceived);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (roomId: string) => {
      setRoomId(roomId);
    };

    socket.on('room-joined', handleRoomJoined);

    return () => {
      socket.off('room-joined', handleRoomJoined);
    };
  }, [socket]);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    socket?.emit('create-room', newRoomId);
  };

  const joinRoom = (event: React.FormEvent) => {
    event.preventDefault();
    socket?.emit('join-room', joinRoomId);
  };

  const leaveRoom = () => {
    socket?.emit('leave-room', roomId);
    setRoomId(null);
  };

  const sendData = () => {
    socket?.emit('send-data', { roomId, data: 'Hello, Room!' });
  };

  return (
    <div>
      {!roomId ? (
        <>
          <button className="text-acai-white" onClick={createRoom}>
            Create Room
          </button>
          <form onSubmit={joinRoom}>
            <label className="text-acai-white">
              Room ID:
              <input
                className="text-acai-white ml-2"
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
              />
            </label>
            <button className="text-acai-white" type="submit">
              Join Room
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-acai-white">Your Room ID: {roomId}</h2>
          <button className="text-acai-white" onClick={sendData}>
            Send Data
          </button>
          <p className="text-acai-white">Received data: {data}</p>
          <button className="text-acai-white" onClick={leaveRoom}>
            Leave Room
          </button>
        </>
      )}
    </div>
  );
};

export default RoomManager;
