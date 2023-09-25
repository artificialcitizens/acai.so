/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext, useEffect, useState } from 'react';
import { useAva } from '../Ava/use-ava';

import useSpeechRecognition from '../../hooks/use-speech-recognition';
import { useBark } from '../../hooks/use-bark';

import { useElevenlabs } from '../../hooks/use-elevenlabs';
import ScratchPad from '../ScratchPad/ScratchPad';
import { TTSState, VoiceState, useVoiceCommands } from './use-voice-command';
import { useWebSpeechSynthesis } from '../../hooks/use-web-tts';
import { getToken } from '../../utils/config';
import { toastifyError, toastifyInfo } from '../Toast';
import { useActor } from '@xstate/react';
import {
  GlobalStateContextValue,
  GlobalStateContext,
} from '../../context/GlobalStateContext';
import { useParams } from 'react-router-dom';
import { ChatHistory } from '../../state';
import Dropdown from '../DropDown';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';
import { simplifyResponseChain } from '../../lib/ac-langchain/chains/simplify-response-chain';
import useBroadcastManager from '../../hooks/use-broadcast-manager';

interface VoiceRecognitionProps {
  audioContext?: AudioContext;
  onVoiceActivation: (bool: boolean) => void;
}

// @TODO: create xstate machine for voice recognition
// @TODO: separate logic and refactor
// @TODO: pass user transcript to useAva hook
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onVoiceActivation,
  audioContext,
}) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const { queryAva, loading } = useAva();
  const [ttsLoading, setTtsLoading] = useState<boolean>(false);
  const elevenlabsKey = getToken('ELEVENLABS_API_KEY');
  const { synthesizeElevenLabsSpeech, voices } = useElevenlabs();
  const [elevenLabsVoice, setElevenLabsVoice] = useLocalStorageKeyValue(
    'ELEVENLABS_VOICE',
    voices?.[0]?.value,
  );
  const [singleCommandMode, setSingleCommandMode] = useState<boolean>(false);
  const [synthesisMode, setSynthesisMode] = useLocalStorageKeyValue(
    'VOICE_SYNTHESIS_MODE',
    'elevenlabs',
  );
  const [manualTTS, setManualTTS] = useState<string>('');
  const [transcriptionOn, setTranscription] = useLocalStorageKeyValue(
    'TRANSCRIPTION_ON',
    'true',
  );
  const [barkUrl, setBarkUrl] = useLocalStorageKeyValue(
    'BARK_URL',
    import.meta.env.VITE_BARK_SERVER ||
      getToken('BARK_URL') ||
      'http://localhost:5000',
  );
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
  const tabManager = useBroadcastManager('acai', () => {
    toggleWebspeech(false);
  });

  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const workspaceId = rawWorkspaceId || 'docs';
  const recentChatHistory = state.context[workspaceId]?.recentChatHistory;
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const srcRef = React.useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);

  useEffect(() => {
    tabManager.notifyNewTab();
  }, [tabManager]);

  const toggleWebspeech = (bool: boolean) => {
    const booleanString = bool ? 'true' : 'false';
    setTranscription(booleanString);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSingleCommandMode(event.target.checked);
  };

  const handleSpeechChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleWebspeech(event.target.checked);
  };

  const handleVoiceStateChange = (voiceState: VoiceState) => {
    setVoiceRecognitionState(voiceState);
  };

  const handleBarkFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!barkUrl) {
      toastifyError('Missing Bark Server URL');
      return;
    }
    setBarkUrl(barkUrl);
    //@TODO: update to run a test request
    toastifyInfo('Connected to Bark Server');
  };

  const normalizedAudioElement = async (
    audioElem: HTMLAudioElement,
    audioBlob: Blob,
    audioContext: AudioContext,
  ) => {
    if (!srcRef.current) {
      srcRef.current = audioContext.createMediaElementSource(audioElem);
    }

    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContext.createGain();
    }

    gainNodeRef.current.gain.value = 1.0;

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
    gain = Math.max(gain, 0.02);
    gain = Math.min(gain, 1);

    gainNodeRef.current!.gain.value = gain;
  };

  useEffect(() => {
    const isOn = voiceRecognitionState !== 'idle';
    onVoiceActivation(isOn);
  }, [voiceRecognitionState, onVoiceActivation]);

  const handleVoiceRecognition = async (t: string) => {
    if (!t || t.split(' ').length < 2) return;
    if (ttsLoading) return;

    switch (voiceRecognitionState) {
      case 'voice': {
        synthesizeAndPlay(t);
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
        toastifyInfo('Generating Text');
        const { response } = await queryAva(t, '');
        const sentenceDelimiters = ['.', '?', '!'];
        const sentenceCount = sentenceDelimiters.reduce(
          (count, delimiter) => count + response.split(delimiter).length - 1,
          0,
        );

        let voiceResponse;
        // if response is longer than 3 sentences implify it
        if (sentenceCount > 3) {
          voiceResponse = await simplifyResponseChain(
            `User:${t}\n\nAssistant:${response}\n\nSingle Sentence Response:`,
          );
        } else {
          voiceResponse = response;
        }
        synthesizeAndPlay(voiceResponse).then(async () => {
          const res = await Promise.resolve(response);
          const assistantChatHistory: ChatHistory = {
            id: workspaceId,
            text: res,
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

  const synthesizeAndPlay = async (response: string) => {
    if (ttsLoading) return;
    setTtsLoading(true);
    try {
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
        audioData = await synthesizeElevenLabsSpeech(response, elevenLabsVoice);
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
    const updatedUserTranscript = userTranscript
      ? userTranscript + '\n' + t
      : t;
    setUserTranscript(updatedUserTranscript);
    handleVoiceCommand(t);
    handleVoiceRecognition(updatedUserTranscript);
  };

  useSpeechRecognition({
    onTranscriptionComplete,
    // @TODO: Fix hacky listening state
    active: !ttsLoading && transcriptionOn === 'true' ? true : false,
  });

  const handleManualTTS = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    synthesizeAndPlay(manualTTS);
    setManualTTS('');
  };

  const options = [
    { value: 'webSpeech', label: 'Web Speech API' },
    { value: 'elevenlabs', label: 'Elevenlabs' },
    import.meta.env.DEV && { value: 'bark', label: 'Bark' },
  ];

  const handleElevenLabsDropdownChange = (value: string) => {
    setElevenLabsVoice(value);
  };

  const voiceStateOptions = [
    { value: 'idle', label: 'Idle' },
    { value: 'ava', label: 'Ava' },
    { value: 'notes', label: 'Notes' },
    { value: 'voice', label: 'Voice' },
  ];

  return (
    <div
      className={`rounded-lg mb-2 items-center justify-between flex-col flex-grow h-full`}
    >
      <span className="flex mb-2 items-center">
        <label
          className="text-xs font-bold text-acai-white ml-2"
          htmlFor="transcriptionOn"
        >
          Transcribe
        </label>
        <input
          className="mx-1 mt-[0.125rem]"
          type="checkbox"
          id="transcriptionOn"
          name="option"
          checked={transcriptionOn === 'true' ? true : false}
          onChange={handleSpeechChange}
        />
      </span>
      <p className="text-acai-white mb-2 ml-2">User Transcript</p>
      <ScratchPad
        placeholder="User Transcript"
        readonly
        content={userTranscript}
      />
      <button
        className="bg-light text-acai-white px-4 py-2 mb-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
        type="button"
        onClick={() => {
          setUserTranscript('');
        }}
      >
        Clear Transcript
      </button>
      <hr />
      <Dropdown
        label="Synthesis Mode"
        options={voiceStateOptions}
        value={voiceRecognitionState}
        onChange={(e) => handleVoiceStateChange(e as VoiceState)}
      />

      <span className="flex mb-2 items-start">
        <label className="text-acai-white ml-2" htmlFor="singleCommandMode">
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

      <span className="flex flex-col">
        <Dropdown
          label="TTS Engine"
          options={options.filter((o) => o !== undefined) as any}
          value={synthesisMode}
          onChange={(e) => setSynthesisMode(e as TTSState)}
        />
        {synthesisMode === 'elevenlabs' && (
          <Dropdown
            label="Voice"
            options={voices}
            value={elevenLabsVoice || voices?.[0]?.value || ''}
            onChange={handleElevenLabsDropdownChange}
          />
        )}
        {synthesisMode === 'bark' && (
          <form className="mb-2" onSubmit={handleBarkFormSubmit}>
            <span className="flex mb-2 items-center">
              <label
                htmlFor="url"
                className="text-acai-white pr-2 w-[50%] ml-2"
              >
                Bark Server URL:
              </label>
              <input
                id="url"
                className="text-acai-white bg-base px-[2px]"
                type="password"
                value={barkUrl}
                onChange={(e) => setBarkUrl(e.target.value)}
              />
            </span>
            <input
              type="submit"
              value="Connect"
              className="bg-light text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
            />
          </form>
        )}
        <form
          className="text-acai-white w-full flex flex-col flex-grow my-2"
          onSubmit={handleManualTTS}
        >
          <label className="mb-2 ml-2 text-xs" htmlFor="manualTTS">
            Manual TTS
          </label>
          <textarea
            placeholder="Enter text to synthesize, press submit or enter to play"
            id="manualTTS"
            className="rounded bg-base text-acai-white p-4 mb-2"
            value={manualTTS}
            onChange={(e) => setManualTTS(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualTTS(e);
              }
            }}
          />
          <button
            className="bg-light text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
            type="submit"
          >
            Submit
          </button>
        </form>
      </span>
      {audioContext && (
        <audio
          ref={audioRef}
          className="rounded-full p-2 w-full"
          controls
          src={audioSrc ? audioSrc : undefined}
          autoPlay
          onPlay={() => {
            srcRef.current!.connect(gainNodeRef.current!);
            gainNodeRef.current!.connect(audioContext.destination);
          }}
          onEnded={() => {
            if (singleCommandMode) setVoiceRecognitionState('idle');
            setUserTranscript('');
            setTtsLoading(false);
            srcRef.current!.disconnect(gainNodeRef.current!);
            gainNodeRef.current!.disconnect(audioContext.destination);
          }}
          onError={() => {
            toastifyError('Error playing audio');
            setTtsLoading(false);
            srcRef.current!.disconnect(gainNodeRef.current!);
            gainNodeRef.current!.disconnect(audioContext.destination);
          }}
        />
      )}
    </div>
  );
};

export default VoiceRecognition;

{
  /* 
                <Whisper
                onRecordingComplete={(blob) => console.log(blob)}
                onTranscriptionComplete={async (t) => {
                  console.log('Whisper Server Response', t);
                }}
              />
             */
}

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
