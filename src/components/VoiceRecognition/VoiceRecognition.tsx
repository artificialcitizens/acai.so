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

interface VoiceRecognitionProps {
  onVoiceActivation: (bool: boolean) => void;
}
// @TODO: create xstate machine for voice recognition
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onVoiceActivation,
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
  const {
    uiStateService,
    agentStateService,
    appStateService,
  }: GlobalStateContextValue = useContext(GlobalStateContext);
  const [state, send] = useActor(agentStateService);
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const recentChatHistory = state.context[workspaceId]?.recentChatHistory;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSingleCommandMode(event.target.checked);
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
          type: 'UPDATE',
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

  const handleTtsServiceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSynthesisMode(event.target.value as TTSState);
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
        synthesizeWebSpeech(response);
        setUserTranscript('');
        setTtsLoading(false);
        if (singleCommandMode) setVoiceRecognitionState('idle');
        return;
      } else {
        setTtsLoading(false);
        return;
      }

      if (audioData) {
        const audioBlob = new Blob([audioData], {
          type: synthesisMode === 'bark' ? 'audio/wav' : 'audio/mpeg',
        });
        const audioUrl = URL.createObjectURL(audioBlob);
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
  useSpeechRecognition({ onTranscriptionComplete, active: !ttsLoading });

  return (
    <div
      className={`rounded-lg mb-2 items-center justify-between flex-col flex-grow`}
    >
      {audioSrc && (
        <audio
          controls
          src={audioSrc}
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
      <select
        className="bg-base text-dark font-medium p-1 mb-2"
        value={synthesisMode}
        onChange={handleTtsServiceChange}
      >
        <option className="text-light" value="webSpeech">
          Web Speech API
        </option>
        <option className="text-light" value="bark">
          Bark
        </option>
        <option className="text-light" value="elevenlabs">
          Elevenlabs
        </option>
      </select>
      <span className="flex mb-2">
        <label className="text-light ml-2" htmlFor="singleCommandMode">
          Single Command Mode
        </label>
        <input
          className="mx-1"
          type="checkbox"
          id="singleCommandMode"
          name="option"
          checked={singleCommandMode}
          onChange={handleChange}
        />
      </span>
      <ScratchPad
        placeholder="User Transcript"
        height="24px"
        readonly
        content={userTranscript || 'User Transcript'}
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
