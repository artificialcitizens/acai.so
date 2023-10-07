import { useEffect, useRef } from 'react';
import CallbackQueue from '../utils/callback-queue';
const queue = new CallbackQueue();
import { isWebSpeechApiSupported } from '../utils/browser-support';
import { toastifyError } from '../components/Toast';
const isWebSpeechSupported = isWebSpeechApiSupported();
/**
 * Uses the Web Speech API to listen for speech and transcribe it to text.
 * Only supported in browsers that support the Web Speech API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 */
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
    if (!isWebSpeechSupported) {
      toastifyError(
        'Speech recognition is not supported in this browser. Please use Chrome.',
      );
      return;
    }

    speechRecognitionRef.current = new (
      window as any
    ).webkitSpeechRecognition();
    speechRecognitionRef.current.continuous = true;
    speechRecognitionRef.current.interimResults = true;
    queue.addCallback(speechRecognitionRef.current.start());

    const onEnd = () => {
      if (!active) {
        speechRecognitionRef.current.onend = null;
        queue.addCallback(speechRecognitionRef.current.stop());
        return;
      }
      // queue.addCallback(speechRecognitionRef.current.start());
    };

    speechRecognitionRef.current.onend = onEnd;

    return () => {
      speechRecognitionRef.current.onend = null;
      queue.addCallback(speechRecognitionRef.current.stop());
      speechRecognitionRef.current.removeEventListener('end', onEnd);
    };
  }, [active]);

  useEffect(() => {
    if (!speechRecognitionRef.current || !active) return;

    const onResult = async (event: {
      resultIndex: any;
      results: string | any[];
    }) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (!transcript) return;
          onTranscriptionComplete(transcript);
        }
      }
    };

    speechRecognitionRef.current.onresult = onResult;

    return () => {
      speechRecognitionRef.current.removeEventListener('result', onResult);
    };
  }, [active, onTranscriptionComplete]);

  return speechRecognitionRef;
}

export default useSpeechRecognition;
