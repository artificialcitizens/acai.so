/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext, useEffect, useState } from 'react';
import { useAva } from '../../hooks/use-ava';

import useSpeechRecognition from '../../hooks/use-speech-recognition';
import { useBark } from '../../hooks/use-bark';

import { useElevenlabs } from '../../hooks/use-elevenlabs';
import ScratchPad from '../ScratchPad/ScratchPad';
import { TTSState, useVoiceCommands } from './use-voice-command';
import { useWebSpeechSynthesis } from '../../hooks/use-web-tts';
import { getToken } from '../../utils/config';
import { toastifyError, toastifyInfo } from '../Toast';
import { useActor } from '@xstate/react';
import {
  GlobalStateContextValue,
  GlobalStateContext,
} from '../../context/GlobalStateContext';
import { useLocation } from 'react-router-dom';
import { ChatHistory } from '../../state';
import Dropdown from '../DropDown';

interface VoiceRecognitionProps {
  audioContext?: AudioContext;
  onVoiceActivation: (bool: boolean) => void;
}

let src: MediaElementAudioSourceNode | null = null;

const normalizedAudioElement = async (
  audioElem: HTMLAudioElement,
  audioBlob: Blob,
  audioContext: AudioContext,
) => {
  if (!src) {
    src = audioContext.createMediaElementSource(audioElem);
  }

  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0;

  audioElem.addEventListener(
    'play',
    () => {
      src!.connect(gainNode);
      gainNode.connect(audioContext.destination);
    },
    true,
  );

  audioElem.addEventListener(
    'pause',
    () => {
      src!.disconnect(gainNode);
      gainNode.disconnect(audioContext.destination);
    },
    true,
  );

  const arrayBuffer = await audioBlob.arrayBuffer();
  const decodedData = await audioContext.decodeAudioData(arrayBuffer);

  const decodedBuffer = decodedData.getChannelData(0);
  const sliceLen = Math.floor(decodedData.sampleRate * 0.05);
  const averages = [];
  let sum = 0.0;
  for (let i = 0; i < decodedBuffer.length; i++) {
    sum += decodedBuffer[i] ** 2;
    if (i % sliceLen === 0) {
      sum = Math.sqrt(sum / sliceLen);
      averages.push(sum);
      sum = 0;
    }
  }
  averages.sort((a, b) => a - b);
  const a = averages[Math.floor(averages.length * 0.95)];

  let gain = 1.0 / a;
  gain = gain / 10.0;
  console.log('gain determined', a, gain);
  gainNode.gain.value = gain;
};

// @TODO: create xstate machine for voice recognition
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onVoiceActivation,
  audioContext,
}) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [fetchAvaResponse, avaLoading] = useAva();
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const elevenlabsKey = getToken('ELEVENLABS_API_KEY');
  const [singleCommandMode, setSingleCommandMode] = useState<boolean>(false);
  const [synthesisMode, setSynthesisMode] = useState<
    'bark' | 'elevenlabs' | 'webSpeech'
  >('bark');
  const [manualTTS, setManualTTS] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const synthesizeElevenLabsSpeech = useElevenlabs();
  const synthesizeBarkSpeech = useBark();
  const synthesizeWebSpeech = useWebSpeechSynthesis();
  const {
    setUserTranscript,
    setVoiceRecognitionState,
    userTranscript,
    voiceRecognitionState,
    handleVoiceCommand,
  } = useVoiceCommands();
  const { agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [state, send] = useActor(agentStateService);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const recentChatHistory = state.context[workspaceId]?.recentChatHistory;
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSingleCommandMode(event.target.checked);
  };

  const handleSpeechChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setListening(event.target.checked);
  };

  useEffect(() => {
    const isOn = voiceRecognitionState !== 'idle';
    onVoiceActivation(isOn);
  }, [voiceRecognitionState, onVoiceActivation]);

  const handleVoiceRecognition = (t: string) => {
    if (!t || t.split(' ').length < 2) return;
    if (ttsLoading) return;

    switch (voiceRecognitionState) {
      case 'voice': {
        synthesizeAndPlay(Promise.resolve(t), 'ava');
        break;
      }
      case 'ava': {
        const userChatHistory: ChatHistory = {
          id: workspaceId,
          text: t.trim(),
          timestamp: Math.floor(Date.now() / 1000).toString(),
          type: 'user',
        };

        send({
          type: 'UPDATE_CHAT_HISTORY',
          agent: {
            workspaceId: workspaceId,
            recentChatHistory: [...recentChatHistory, userChatHistory],
          },
        });
        const avaResponse = fetchAvaResponse(t, '');
        synthesizeAndPlay(avaResponse, 'ava').then(async () => {
          const response = await Promise.resolve(avaResponse);
          const assistantChatHistory: ChatHistory = {
            id: workspaceId,
            text: response,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'ava',
          };
          send({
            type: 'UPDATE_CHAT_HISTORY',
            workspaceId: workspaceId,
            recentChatHistory: [
              ...recentChatHistory,
              userChatHistory,
              assistantChatHistory,
            ],
          });
        });

        break;
      }
      case 'notes':
      case 'idle':
        break;
    }
  };

  const synthesizeAndPlay = async (
    responsePromise: Promise<string>,
    voice: string,
  ) => {
    if (ttsLoading) return;
    setTtsLoading(true);
    try {
      const response = await responsePromise;
      let audioData;
      toastifyInfo('Generating Audio');
      if (synthesisMode === 'bark') {
        audioData = await synthesizeBarkSpeech({
          inputText: response,
          voicePreset: undefined,
        });
      } else if (synthesisMode === 'elevenlabs') {
        if (!elevenlabsKey) {
          toastifyError('Missing Elevenlabs API Key');
          setTtsLoading(false);
          return;
        }
        audioData = await synthesizeElevenLabsSpeech(response, voice);
      } else if (synthesisMode === 'webSpeech') {
        synthesizeWebSpeech(response, () => {
          setUserTranscript('');
          setTtsLoading(false);
        });
        if (singleCommandMode) setVoiceRecognitionState('idle');
        return;
      } else {
        setTtsLoading(false);
        return;
      }

      if (audioData && audioContext && audioRef.current) {
        const audioBlob = new Blob([audioData], {
          type: synthesisMode === 'bark' ? 'audio/wav' : 'audio/mpeg',
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        normalizedAudioElement(audioRef.current, audioBlob, audioContext);
        setAudioSrc(audioUrl);
      }
      if (singleCommandMode) {
        setVoiceRecognitionState('idle');
      }
    } catch (error) {
      toastifyError('Error synthesizing speech');
      setTtsLoading(false);
    }
  };

  const onTranscriptionComplete = async (t: string) => {
    const updatedUserTranscript = userTranscript + '\n' + t + '\n';
    setUserTranscript(updatedUserTranscript);
    handleVoiceCommand(t);
    handleVoiceRecognition(updatedUserTranscript);
  };

  // @TODO add a way to turn off voice recognition
  useSpeechRecognition({
    onTranscriptionComplete,
    active: !ttsLoading && listening,
  });

  const handleManualTTS = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    synthesizeAndPlay(Promise.resolve(manualTTS), 'ava');
    setManualTTS('');
  };

  const handleTtsServiceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSynthesisMode(event.target.value as TTSState);
  };

  const options = [
    { value: 'webSpeech', label: 'Web Speech API' },
    { value: 'bark', label: 'Bark' },
    { value: 'elevenlabs', label: 'Elevenlabs' },
  ];
  const handleDropdownChange = (value: string) => {
    handleTtsServiceChange({
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div
      className={`rounded-lg mb-2 items-center justify-between flex-col flex-grow`}
    >
      {audioContext && (
        <audio
          ref={audioRef}
          className="rounded-full p-2"
          controls
          src={audioSrc ? audioSrc : undefined}
          autoPlay
          onEnded={() => {
            if (singleCommandMode) setVoiceRecognitionState('idle');
            setUserTranscript('');
            setTtsLoading(false);
          }}
          onError={() => {
            toastifyError('Error playing audio');
            setTtsLoading(false);
          }}
        />
      )}
      <span className="flex">
        <Dropdown
          label="Synthesis Mode"
          options={options}
          value={synthesisMode}
          onChange={handleDropdownChange}
        />
        <span className="flex mb-2 items-start">
          <label className="text-light ml-2" htmlFor="singleCommandMode">
            Single Command
          </label>
          <input
            className="mx-1 mt-[0.25rem]"
            type="checkbox"
            id="singleCommandMode"
            name="option"
            checked={singleCommandMode}
            onChange={handleChange}
          />
        </span>
        <span className="flex mb-2 items-start">
          <label className="text-light ml-2" htmlFor="singleCommandMode">
            Speech Recognition
          </label>
          <input
            className="mx-1 mt-[0.25rem]"
            type="checkbox"
            id="singleCommandMode"
            name="option"
            checked={listening}
            onChange={handleSpeechChange}
          />
        </span>
      </span>
      <ScratchPad
        placeholder="User Transcript"
        height="24px"
        readonly
        content={userTranscript || 'User Transcript'}
      />
      <form
        className="text-light w-full flex flex-col flex-grow my-2"
        onSubmit={handleManualTTS}
      >
        <textarea
          placeholder="Manual TTS"
          className="rounded bg-base text-light p-4"
          value={manualTTS}
          onChange={(e) => setManualTTS(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleManualTTS(e);
            }
          }}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
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
