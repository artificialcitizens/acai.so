// hooks/useWebSpeechSynthesis.ts
import { useCallback } from 'react';

interface WebSpeechSynthesisOptions {
  pitch?: number;
  rate?: number;
}

export const useWebSpeechSynthesis = () => {
  const synthesizeSpeech = useCallback((inputText: string, options: WebSpeechSynthesisOptions = {}) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = inputText;
      utterance.voice = speechSynthesis.getVoices()[0]; // Choose a voice
      utterance.pitch = options.pitch || 1; // Range: 0 to 2
      utterance.rate = options.rate || 0.65; // Range: 0.1 to 10

      speechSynthesis.speak(utterance);
    } else {
      console.warn('The browser does not support the Web Speech API');
    }
  }, []);

  return synthesizeSpeech;
};
