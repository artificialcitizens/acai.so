// hooks/useBark.ts
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/config';

export const useBark = () => {
  const [token, setToken] = useState(getToken('BARK_URL'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getToken('BARK_URL'));
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const synthesizeBarkSpeech = useCallback(
    async ({
      inputText,
      voicePreset,
    }: {
      inputText: string;
      voicePreset: string | undefined;
    }) => {
      const options = {
        method: 'POST',
        url: `${
          import.meta.env.VITE_BARK_URL || getToken('BARK_URL')
        }/bark-inference`,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          text: inputText,
          voice: voicePreset,
        },
        responseType: 'arraybuffer' as 'json',
      };

      const speechDetails = await axios.request(options);
      return speechDetails.data;
    },
    [],
  );

  return synthesizeBarkSpeech;
};
