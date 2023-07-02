import React, { useEffect, useRef, useState } from 'react';
import CallbackQueue from './CallbackQueue';

interface SpeechRecognitionProps {
  onTranscriptionComplete: (transcript: string) => void;
  onClick?: () => void;
  active: boolean;
}
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}
const queue = new CallbackQueue();

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ onTranscriptionComplete, active, onClick }) => {
  const speechRecognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!active) return;
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
  }, [active]);

  useEffect(() => {
    if (!speechRecognitionRef.current) return;

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
    <span className="flex items-center justify-between flex-grow rounded-md mb-2">
      <span className="text-light">Speech</span>
      <button
        className={active ? 'p-0 w-6 h-6 rounded-full bg-red-500' : 'rounded-full p-0 w-6 h-6 bg-slate-400'}
        onClick={() => {
          if (!active) {
            queue.addCallback(speechRecognitionRef.current.start());
          } else {
            speechRecognitionRef.current.onend = null;
            queue.addCallback(speechRecognitionRef.current.stop());
          }
          if (onClick) onClick();
        }}
      />
    </span>
  );
};

export default SpeechRecognition;