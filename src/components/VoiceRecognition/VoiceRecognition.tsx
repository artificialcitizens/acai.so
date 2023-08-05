/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext, useEffect, useState } from 'react';
import { useAva } from '../../hooks/use-ava';
import useCookieStorage from '../../hooks/use-cookie-storage';
import { toastifyInfo } from '../Toast';

import useSpeechRecognition from '../../hooks/use-speech-recognition';
import { useBark } from '../../hooks/use-bark';
import AudioWaveform from '../AudioWave/AudioWave';

import { useElevenlabs } from '../../hooks/use-elevenlabs';
import ScratchPad from '../ScratchPad/ScratchPad';
import { useVoiceCommands } from './use-voice-command';

interface VoiceRecognitionProps {
  audioContext?: AudioContext;
}

const voices = {
  strahl: 'Gdbj8IU3v0OzqfE4M5dz',
  ava: 'XNjihqQlHh33hdGwAdnE',
};

// https://github.com/suno-ai/bark/blob/main/notebooks/long_form_generation.ipynb
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ audioContext }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [fetchResponse, avaLoading] = useAva();
  const [openAIApiKey] = useCookieStorage('OPENAI_KEY');
  const [elevenlabsKey] = useCookieStorage('ELEVENLABS_API_KEY');
  const synthesizeBarkSpeech = useBark();
  const synthesizeSpeech = useElevenlabs(voices, elevenlabsKey || '');
  const [synthesisMode, setSynthesisMode] = useState<'bark' | 'elevenlabs'>('elevenlabs');
  const [manualTTS, setManualTTS] = useState<string>('');

  const { userTranscript, setUserTranscript, voiceRecognitionState, setVoiceRecognitionState, handleVoiceCommand } =
    useVoiceCommands();

  const handleVoiceRecognition = (t: string) => {
    switch (voiceRecognitionState) {
      case 'voice2voice': {
        if (!t || t.split(' ').length < 2) return;
        if (!elevenlabsKey) return;
        synthesizeAndPlay(Promise.resolve(t), 'strahl');
        setUserTranscript('');
        break;
      }
      case 'ava': {
        const avaResponse = fetchResponse(
          t,
          'this is a voice synthesis pipeline, which means I can speak to you and you can respond with your voice.',
        );
        synthesizeAndPlay(avaResponse, 'ava');
        break;
      }
      case 'strahl': {
        const strahlResponse = fetchResponse(
          t,
          'you are to respond as Chris Strahl, Ceo of Knapsack. Joshs place of employment',
        );
        synthesizeAndPlay(strahlResponse, 'strahl');
        break;
      }
      case 'notes':
        setUserTranscript(userTranscript + '\n' + t);
        break;
      case 'idle':
        break;
    }
  };

  const synthesizeAndPlay = async (responsePromise: Promise<string>, voice: string) => {
    const response = await responsePromise;
    let audioData;

    if (synthesisMode === 'bark') {
      audioData = await synthesizeBarkSpeech({ inputText: response, voicePreset: 'v2/en_speaker_9' });
    } else if (synthesisMode === 'elevenlabs' && elevenlabsKey) {
      audioData = await synthesizeSpeech(response, voice);
    }

    if (audioData) {
      const audioBlob = new Blob([audioData], { type: synthesisMode === 'bark' ? 'audio/wav' : 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
      setUserTranscript('');
    }
  };
  const onTranscriptionComplete = async (t: string) => {
    if (!openAIApiKey) {
      toastifyInfo('Please set your OpenAI key in the settings');
      return;
    }
    const updatedUserTranscript = userTranscript + '\n' + t + '\n';
    setUserTranscript(updatedUserTranscript);
    handleVoiceCommand(t);
    handleVoiceRecognition(updatedUserTranscript);
  };

  useSpeechRecognition({ onTranscriptionComplete, active: true });
  const isOn =
    voiceRecognitionState === 'ava' || voiceRecognitionState === 'notes' || voiceRecognitionState === 'strahl';

  return (
    <>
      {audioContext && <AudioWaveform audioContext={audioContext} isOn={isOn} />}

      <div className={`rounded-lg mb-2 items-center justify-between flex-col flex-grow`}>
        {audioSrc && (
          <audio
            controls
            src={audioSrc}
            autoPlay
            onEnded={() => {
              setTimeout(() => {
                setAudioSrc(null);
                if (voiceRecognitionState === 'ava' || voiceRecognitionState === 'following')
                  setVoiceRecognitionState('idle');
              }, 200);
            }}
          />
        )}
        <ScratchPad
          placeholder="User Transcript"
          height="24px"
          readonly
          content={userTranscript}
          handleInputChange={(e) => {}}
        />
        <form
          className="text-light w-full flex flex-col flex-grow my-2"
          onSubmit={(e) => {
            e.preventDefault();
            synthesizeAndPlay(Promise.resolve(manualTTS), 'ava');
            setManualTTS('');
          }}
        >
          <textarea
            placeholder="Manual TTS"
            className="rounded bg-base text-light p-4"
            value={manualTTS}
            onChange={(e) => setManualTTS(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default VoiceRecognition;

// import useElementPosition from '../../hooks/use-element-position';
// import { useHighlightedText } from '../../hooks/use-highlighted-text';
// import CursorDebug from './components/Cursor/CursorDebug';
// const [elementPosition, updateElementSelector, elementName] = useElementPosition("[data-ava-element='audio-wave']");
// const [agentCursorPos, setAgentCursorPos] = useState([{ x: elementPosition.x, y: elementPosition.y }]);
// const highlightedText = useHighlightedText();
// case 'follow me':
//   setUserTranscript('');
//   // adjust to follow the cursor
//   toastifyInfo('Following');
//   setVoiceRecognitionState('following');
//   break;

// case 'following': {
//   if (!updatedUserTranscript || !elevenlabsKey) return;
//   const systemNotes =
//     'You are responding via voice synthesis, keep the final answer short and to the point. Answer the users question about this text: ' +
//     highlightedText;
//   synthesizeAndPlay(fetchResponse(updatedUserTranscript, systemNotes), 'ava');
//   break;
// }
// import Cursor from '../Cursor/Cursor';
// useEffect(() => {
//   setAgentCursorPos([elementPosition]);
// }, [elementPosition]);

// const handleReachedDestination = () => {
//   console.log('Cursor has reached its destination', elementName);
//   const isUppercase = elementName === elementName.toUpperCase();
//   if (isUppercase) {
//     globalServices.uiStateService.send({ type: elementName, workspaceId });
//   }
//   console.log(isUppercase); // Outputs: true
// };

// // Get the center of the screen
// const centerX = window.innerWidth / 2;
// const centerY = window.innerHeight / 2;
// {
//   /* <Cursor
//       style={{
//         visibility: !isOn ? 'hidden' : 'visible',
//         display: !isOn ? 'hidden' : '',
//       }}
//       coordinates={agentCursorPos}
//       onReachedDestination={handleReachedDestination}
//       speed={1.25}
//     /> */
// }
