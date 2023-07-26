import { useEffect, useRef } from 'react';
import CallbackQueue from '../utils/callback-queue';
const queue = new CallbackQueue();

function useSpeechRecognition({
  onTranscriptionComplete,
  active,
}: {
  onTranscriptionComplete: (transcript: string) => void;
  active: boolean;
}) {
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

  return speechRecognitionRef;
}

export default useSpeechRecognition;
