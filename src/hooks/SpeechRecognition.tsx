import { useEffect, useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState<string>('');
  const activationWord = 'start recording'; // Change this to your activation word
  const speechRecognitionRef = new window.webkitSpeechRecognition();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    speechRecognitionRef.continuous = true;
    speechRecognitionRef.interimResults = true;
    // on end we need to restart the service
    speechRecognitionRef.onend = () => {
      console.log('Speech recognition service disconnected');
      speechRecognitionRef.start();
    };

    speechRecognitionRef.start();
    // Clean up the listener when the component is unmounted
    return () => {
      speechRecognitionRef.stop();
    };
  }, []);

  useEffect(() => {
    if (!speechRecognitionRef) return;

    // Handle the result event
    speechRecognitionRef.onresult = (event: { resultIndex: any; results: string | any[] }) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          console.log(transcript);
          setTranscript(transcript);
          // If the transcript includes the activation word, start recording
          if (transcript.includes(activationWord)) {
            console.log(activationWord);
          }
        }
      }
    };
  }, [activationWord]);

  return transcript;
};
