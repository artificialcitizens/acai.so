// hooks/useTextToSpeech.ts
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/config';
import { Option } from '../components/DropDown/';

export const useElevenlabs = () => {
  const [voices, setVoices] = useState<Option[]>([]);
  const apiKey =
    getToken('ELEVENLABS_API_KEY') || import.meta.env.VITE_ELEVENLABS_API_KEY;
  const synthesizeElevenLabsSpeech = useCallback(
    async (inputText: string, voice: any) => {
      const options = {
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
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
    [apiKey],
  );

  const getVoices = useCallback(async () => {
    const apiKey =
      getToken('ELEVENLABS_API_KEY') || import.meta.env.VITE_ELEVENLABS_API_KEY;
    const options = {
      method: 'GET',
      url: 'https://api.elevenlabs.io/v1/voices',
      headers: {
        accept: 'application/json',
        'xi-api-key': `${apiKey}`,
      },
    };

    const voiceDetails = await axios.request(options);
    return voiceDetails.data;
  }, []);

  useEffect(() => {
    getVoices().then((data) => {
      const voiceMap: Option[] = data.voices.map(
        (voice: { voice_id: string; name: string }) => ({
          value: voice.voice_id,
          label: voice.name,
        }),
      );
      // reverse so custom voices appear at top of list
      setVoices(voiceMap.reverse());
    });
  }, [getVoices]);

  return { synthesizeElevenLabsSpeech, voices };
};
