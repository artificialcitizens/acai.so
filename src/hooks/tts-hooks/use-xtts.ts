import { useState, useEffect, useRef } from 'react';
import { toastifyInfo } from '../../components/Toast';

type SpeakerRefType = {
  gpt_cond_latent: any;
  speaker_embedding: any;
};

export const useXtts = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const speakerRef = useRef<SpeakerRefType | null>(null);

  useEffect(() => {
    const fetchDefaultSpeakerEmbedding = async () => {
      // if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      //   try {
      //     const stream = await navigator.mediaDevices.getUserMedia({
      //       audio: true,
      //       video: false,
      //     });
      //     stream.getTracks().forEach((x) => x.stop());
      //   } catch (err) {
      //     console.log(err);
      //   }
      // } else {
      //   console.log('getUserMedia not supported');
      // }

      try {
        if (localStorage.getItem('defaultSpeakerEmbedding')) {
          const speakerData = JSON.parse(
            localStorage.getItem('defaultSpeakerEmbedding') || '{}',
          );
          speakerRef.current = speakerData;
          return;
        }
        const response = await fetch('/female.wav');
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('wav_file', blob, 'ref.wav');

        const speakerResponse = await fetch(
          'http://192.168.4.186:8000/clone_speaker',
          {
            method: 'POST',
            body: formData,
          },
        );
        toastifyInfo('Default speaker embedding loaded');
        const speakerData = await speakerResponse.json();
        speakerRef.current = speakerData;
        localStorage.setItem(
          'defaultSpeakerEmbedding',
          JSON.stringify(speakerData),
        );
      } catch (error) {
        console.error('Error fetching default speaker embedding:', error);
      }
    };

    fetchDefaultSpeakerEmbedding();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('wav_file', file);

      const speakerResponse = await fetch(
        'http://192.168.4.186:8000/clone_speaker',
        {
          method: 'POST',
          body: formData,
        },
      );
      toastifyInfo('Default speaker embedding loaded');
      const speakerData = await speakerResponse.json();
      speakerRef.current = speakerData;
      localStorage.setItem(
        'defaultSpeakerEmbedding',
        JSON.stringify(speakerData),
      );
    } else {
      console.error('No file selected');
    }
  };

  const handleTTS = async (text: string, lang: string) => {
    if (!speakerRef.current) return;
    setLoading(true);

    function linearInterpolate(
      sample1: number,
      sample2: number,
      fraction: number,
    ) {
      return sample1 * (1 - fraction) + sample2 * fraction;
    }

    try {
      const response = await fetch('http://192.168.4.186:8000/tts_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: lang,
          gpt_cond_latent: speakerRef.current.gpt_cond_latent,
          speaker_embedding: speakerRef.current.speaker_embedding,
          add_wav_header: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const audioContext = new window.AudioContext();
      const playbackSpeed = 24000 / audioContext.sampleRate;
      const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
      scriptNode.connect(audioContext.destination);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      let audioQueue: number[] = [];
      let isStreamingFinished = false;
      let nextSample = 0;

      scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const outputBuffer =
          audioProcessingEvent.outputBuffer.getChannelData(0);
        for (let i = 0; i < outputBuffer.length; i++) {
          if (nextSample < audioQueue.length) {
            const sampleIndex = Math.floor(nextSample);
            const nextIndex = Math.min(sampleIndex + 1, audioQueue.length - 1);
            const sampleFraction = nextSample - sampleIndex;
            const interpolatedSample = linearInterpolate(
              audioQueue[sampleIndex],
              audioQueue[nextIndex],
              sampleFraction,
            );
            outputBuffer[i] = interpolatedSample / 32768;
            nextSample += playbackSpeed;
          } else {
            outputBuffer[i] = 0; // Fill with silence if no data available
          }
        }

        if (isStreamingFinished && nextSample >= audioQueue.length) {
          // Apply fade-out effect here if needed
          scriptNode.disconnect();
          audioContext.close();
          setLoading(false);
        }
      };

      const processAudioChunk = async ({
        done,
        value,
      }: {
        done: boolean;
        value?: Uint8Array;
      }) => {
        if (done) {
          isStreamingFinished = true;
          return;
        }

        const rawData = new Int16Array(
          value!.buffer,
          value!.byteOffset,
          value!.byteLength / 2,
        );
        audioQueue = audioQueue.concat(Array.from(rawData));

        const nextChunk = await reader.read();
        processAudioChunk(nextChunk);
      };

      const initialChunk = await reader.read();
      processAudioChunk(initialChunk);
    } catch (error) {
      console.error('Error calling TTS service:', error);
      setLoading(false);
    }
  };

  return {
    file,
    setFile,
    loading,
    handleFileChange,
    handleUpload,
    handleTTS,
  };
};
