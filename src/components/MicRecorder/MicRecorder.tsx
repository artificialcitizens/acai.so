import { useAudioRecorder } from 'react-audio-voice-recorder';
import React, { useEffect, useRef, useState } from 'react';
import CallbackQueue from './CallbackQueue';
import socketIOClient from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://192.168.4.94:8080';
interface MicRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onTranscriptionComplete: (transcript: string) => void;
  onVoiceActivation?: (transcript: string) => void;
}
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}
const queue = new CallbackQueue();

const MicRecorder: React.FC<MicRecorderProps> = ({ onRecordingComplete, onTranscriptionComplete }) => {
  const { startRecording, stopRecording, recordingBlob, isRecording } = useAudioRecorder();
  const activationWord = 'start recording'; // Change this to your activation word
  const socketRef = useRef<any | null>(null);
  const speechRecognitionRef = useRef<any | null>(null);
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
    if (!('webkitSpeechRecognition' in window)) return;
    speechRecognitionRef.current = new window.webkitSpeechRecognition();
    speechRecognitionRef.current.continuous = true;
    speechRecognitionRef.current.interimResults = true;
    queue.addCallback(speechRecognitionRef.current.start());
    speechRecognitionRef.current.onend = () => {
      console.log('Speech recognition service disconnected');
      queue.addCallback(speechRecognitionRef.current.start());
    };
    return () => {
      speechRecognitionRef.current.onend = null;
      queue.addCallback(speechRecognitionRef.current.stop());
    };
  }, []);

  useEffect(() => {
    if (!speechRecognitionRef.current) return;

    // Handle the result event
    speechRecognitionRef.current.onresult = async (event: { resultIndex: any; results: string | any[] }) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          console.log('Transcript:', transcript);
          onTranscriptionComplete(transcript);
          if (transcript.includes(activationWord)) {
            startRecording();
          } else if (transcript.includes('stop recording')) {
            stopRecording();
          }
        }
      }
    };
  }, [startRecording, activationWord, stopRecording, onTranscriptionComplete]);

  useEffect(() => {
    const handleResponseText = (response_text: any) => {
      console.log('Received text from server:', response_text.text[0]?.text);
      // Do whatever you want with the text received from the server
    };

    console.log('Listening for transcription events');
    socketRef.current.on('transcription', handleResponseText);

    return () => {
      // Clean up the listener when the component is unmounted
      socketRef.current.off('transcription', handleResponseText);
    };
  }, []);

  const handleStopRecording = () => {
    stopRecording();
  };
  return (
    <span
      className="flex items-center rounded-md max-w-min p-4"
      style={{
        border: '2px solid',
      }}
    >
      <span className="mr-2">Whisper</span>
      <button
        className={isRecording ? 'p-0 w-6 h-6 rounded-full bg-red-500' : 'rounded-full p-0 w-6 h-6 bg-slate-400'}
        onClick={isRecording ? handleStopRecording : startRecording}
      />
    </span>
  );
};

export default MicRecorder;
