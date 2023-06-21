import { useAudioRecorder } from 'react-audio-voice-recorder';
import React, { useEffect, useRef, useState } from 'react';
import CallbackQueue from './CallbackQueue';
import socketIOClient from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://192.168.4.94:8080';
interface MicRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}
const queue = new CallbackQueue();

const MicRecorder: React.FC<MicRecorderProps> = ({ onRecordingComplete }) => {
  const { startRecording, stopRecording, recordingBlob, isRecording } = useAudioRecorder();
  const [recognition, setRecognition] = useState<any | null>(null);
  const activationWord = 'start recording'; // Change this to your activation word
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
        // Send the audio file to the server
        socketRef.current.emit('upload_audio', e.target.result);
      }
    };
    reader.readAsDataURL(recordingBlob);
    onRecordingComplete(recordingBlob);
  }, [recordingBlob, onRecordingComplete]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const speechRecognition = new window.webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    setRecognition(speechRecognition);
    queue.addCallback(speechRecognition.start());

    return () => {
      queue.addCallback(speechRecognition.stop());
    };
  }, []);

  useEffect(() => {
    if (!recognition) return;

    // Handle the result event
    recognition.onresult = (event: { resultIndex: any; results: string | any[] }) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          console.log(transcript);
          // If the transcript includes the activation word, start recording
          if (transcript.includes(activationWord)) {
            startRecording();
          } else if (transcript.includes('stop recording')) {
            stopRecording();
          }
        }
      }
    };
  }, [recognition, startRecording, activationWord, stopRecording]);

  useEffect(() => {
    const handleResponseText = (response_text) => {
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
  return (
    <div>
      <button
        className={isRecording ? 'h-4 w-4 rounded-full bg-red-500' : 'h-4 w-4 rounded-full bg-slate-400'}
        onClick={isRecording ? stopRecording : startRecording}
      />
    </div>
  );
};

export default MicRecorder;
