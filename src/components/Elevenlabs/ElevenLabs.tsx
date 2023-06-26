import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface ElevenLabsProps {
  text: string;
  voice: keyof typeof voices;
}

const voices = {
  strahl: 'Gdbj8IU3v0OzqfE4M5dz',
  ava: 'XNjihqQlHh33hdGwAdnE',
};

// Define a function called textToSpeech that takes in a string called inputText as its argument.
const textToSpeech = async (inputText: string, voice: string) => {
  const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  // Set the ID of the voice to be used.
  const VOICE_ID = voices[voice as keyof typeof voices];

  // Set options for the API request.
  const options = {
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
      'content-type': 'application/json', // Set the content type to application/json.
      'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
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
};

const ElevenLabs: React.FC<ElevenLabsProps> = ({ text, voice }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    if (!text || !active) return;
    textToSpeech(text, voice).then((audioData) => {
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
    });
  }, [text, voice, active]);

  return (
    <>
      <div className="max-w-min rounded-lg p-4 my-2 flex border-2 border-solid border-default items-center flex-col">
        <div className="w-full flex items-center mb-4">
          <span className="mr-2">Elevenlabs</span>
          <button
            className={active ? 'p-0 w-6 h-6 rounded-full bg-red-500' : 'rounded-full p-0 w-6 h-6 bg-slate-400'}
            onClick={() => setActive(!active)}
          />
        </div>
        <audio controls src={audioSrc} autoPlay />
      </div>
    </>
  );
};

export default ElevenLabs;
