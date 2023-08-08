// hooks/useTextToSpeech.ts
import { useCallback } from 'react';
import axios from 'axios';
import { toastifyDefault } from '../components/Toast';
import { getToken } from '../utils/config';

interface Voices {
  [key: string]: string;
}

export const useElevenlabs = (voices: Voices) => {
  const apiKey =
    getToken('ELEVENLABS_API_KEY') || import.meta.env.VITE_ELEVENLABS_API_KEY;
  const synthesizeSpeech = useCallback(
    async (inputText: string, voice: string) => {
      const VOICE_ID = voices[voice];
      const options = {
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        headers: {
          accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
          'content-type': 'application/json', // Set the content type to application/json.
          'xi-api-key': `${apiKey}`, // Set the API key in the headers.
        },
        data: {
          text: inputText, // Pass in the inputText as the text to be converted to speech.
        },
        responseType: 'arraybuffer' as 'json', // Set the responseType to arraybuffer to receive binary data as response.
      };

      // Send the API request using Axios and wait for the response.
      const speechDetails = await axios.request(options);
      // Return the binary audio data received from the API response.
      return speechDetails.data;
    },
    [apiKey, voices],
  );

  return synthesizeSpeech;
};
