import { useAudioRecorder } from 'react-audio-voice-recorder';
import React, { useEffect, useState } from 'react';
import CallbackQueue from './CallbackQueue';

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
  useEffect(() => {
    if (!recordingBlob) return;
    onRecordingComplete(recordingBlob);
  }, [recordingBlob, onRecordingComplete]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const speechRecognition = new window.webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    // // Restart the recognition service when it ends
    // speechRecognition.onend = () => {
    //   queue.addCallback(speechRecognition.start());
    // };

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
