import { useAudioRecorder } from 'react-audio-voice-recorder';
import React, { useEffect, useRef, useState } from 'react';
import CallbackQueue from './CallbackQueue';
import socketIOClient from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://192.168.4.94:8080';
interface SpeechRecognitionProps {
  onTranscriptionComplete: (transcript: string) => void;
}
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}
const queue = new CallbackQueue();

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ onTranscriptionComplete }) => {
  const speechRecognitionRef = useRef<any | null>(null);

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
          onTranscriptionComplete(transcript);
        }
      }
    };
  }, [onTranscriptionComplete]);

  return (
    <span
      className="flex items-center rounded-md max-w-min p-4"
      style={{
        border: '2px solid',
      }}
    >
      <span className="mr-2">Whisper</span>
    </span>
  );
};

export default SpeechRecognition;
