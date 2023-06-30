import { useAudioRecorder } from 'react-audio-voice-recorder';
import React, { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_WHISPER_SOCKET_SERVER;
interface MicRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onTranscriptionComplete: (transcript: string) => void;
}

const Whisper: React.FC<MicRecorderProps> = ({ onRecordingComplete, onTranscriptionComplete }) => {
  const { startRecording, stopRecording, recordingBlob, isRecording } = useAudioRecorder();
  const socketRef = useRef<any | null>(null);
  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL);
    socketRef.current.on('connect', () => {
      console.log('connected');
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!recordingBlob || recordingBlob.size < 25000) return;

    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (e.target?.readyState == FileReader.DONE) {
        // Check if the client is connected to the server
        if (!socketRef.current.connected) {
          console.log('Client is not connected to the server. Reconnecting...');
          socketRef.current.connect();
        }

        // Add a check to ensure that the socket is connected before emitting the event
        const emitAudio = setInterval(() => {
          if (socketRef.current.connected && e.target?.result) {
            // Send the audio file to the server
            socketRef.current.emit('upload_audio', e.target.result);
            clearInterval(emitAudio);
          }
        }, 1000);
      }
    };
    reader.readAsDataURL(recordingBlob);
    onRecordingComplete(recordingBlob);
  }, [recordingBlob, onRecordingComplete]);

  useEffect(() => {
    const handleResponseText = (response_text: any) => {
      onTranscriptionComplete(response_text.text[0]?.text);
    };

    socketRef.current.on('transcription', handleResponseText);

    return () => {
      // Clean up the listener when the component is unmounted
      socketRef.current.off('transcription', handleResponseText);
    };
  }, [onTranscriptionComplete]);

  return (
    <span className="flex items-center rounded-md justify-between mb-2">
      <span className="mr-2 text-light">Whisper</span>
      <button
        className={isRecording ? 'p-0 w-6 h-6 rounded-full bg-red-500' : 'rounded-full p-0 w-6 h-6 bg-slate-400'}
        onClick={isRecording ? stopRecording : startRecording}
      />
    </span>
  );
};

export default Whisper;
