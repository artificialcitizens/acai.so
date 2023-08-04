/* eslint-disable jsx-a11y/media-has-caption */
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useAva } from '../../hooks/use-ava';
import useCookieStorage from '../../hooks/use-cookie-storage';
import { toastifyInfo } from '../Toast';
import { noteChain } from '../../utils/sb-langchain/chains/notes-chain';
import { GlobalStateContext, GlobalStateContextValue } from '../../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import useSpeechRecognition from '../../hooks/use-speech-recognition';
import AudioWaveform from '../AudioWave/AudioWave';
import Cursor from '../Cursor/Cursor';
import useElementPosition from '../../hooks/use-element-position';
import { useHighlightedText } from '../../hooks/use-highlighted-text';
import { useTextToSpeech } from '../../hooks/use-text-to-speech';
// import CursorDebug from './components/Cursor/CursorDebug';

interface VoiceRecognitionProps {
  audioContext?: AudioContext;
}

const voices = {
  strahl: 'Gdbj8IU3v0OzqfE4M5dz',
  ava: 'XNjihqQlHh33hdGwAdnE',
};

type VoiceState = 'idle' | 'ava' | 'notes' | 'strahl' | 'voice2voice' | 'following';
const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ audioContext }) => {
  const globalServices: GlobalStateContextValue = useContext(GlobalStateContext);
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceId = location.pathname.split('/')[1];
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [voiceRecognitionState, setVoiceRecognitionState] = useState<VoiceState>('idle');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [fetchResponse, avaLoading] = useAva();
  const [openAIApiKey] = useCookieStorage('OPENAI_KEY');
  const [elevenlabsKey] = useCookieStorage('ELEVENLABS_API_KEY');
  const [elementPosition, updateElementSelector, elementName] = useElementPosition("[data-ava-element='audio-wave']");
  const [agentCursorPos, setAgentCursorPos] = useState([{ x: elementPosition.x, y: elementPosition.y }]);
  const highlightedText = useHighlightedText();
  const synthesizeSpeech = useTextToSpeech(voices, elevenlabsKey || '');

  const synthesizeAndPlay = async (responsePromise: Promise<string>, voice: string) => {
    if (!elevenlabsKey) return;
    const response = await responsePromise;
    synthesizeSpeech(response, voice).then((audioData) => {
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
    });
  };

  useEffect(() => {
    setAgentCursorPos([elementPosition]);
  }, [elementPosition]);

  const handleReachedDestination = () => {
    console.log('Cursor has reached its destination', elementName);
    const isUppercase = elementName === elementName.toUpperCase();
    if (isUppercase) {
      globalServices.uiStateService.send({ type: elementName, workspaceId });
    }
    console.log(isUppercase); // Outputs: true
  };

  // Get the center of the screen
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const onTranscriptionComplete = async (t: string) => {
    if (!openAIApiKey) {
      toastifyInfo('Please set your OpenAI key in the settings');
      return;
    }

    const updatedUserTranscript = userTranscript + '\n' + t;
    setUserTranscript(updatedUserTranscript);

    switch (t.toLowerCase()) {
      case 'ava':
        setVoiceRecognitionState('ava');
        break;
      case 'take notes':
        setUserTranscript('');
        toastifyInfo('Taking notes');
        setVoiceRecognitionState('notes');
        break;
      case 'voice':
        setUserTranscript('');
        toastifyInfo('Voice to voice active');
        setVoiceRecognitionState('voice2voice');
        break;
      case 'follow me':
        setUserTranscript('');
        // adjust to follow the cursor
        toastifyInfo('Following');
        setVoiceRecognitionState('following');
        break;
      case 'clear chat':
        globalServices.agentStateService.send({ type: 'CLEAR_CHAT', workspaceId });
        break;
      case 'cancel':
        toastifyInfo('Going Idle');
        setVoiceRecognitionState('idle');
        return;
      case 'hey chris':
        setUserTranscript('');
        toastifyInfo('Chris is listening');
        setVoiceRecognitionState('strahl');
        break;
      case 'ready':
        {
          toastifyInfo('Notes being created');
          const notes = await noteChain(userTranscript, openAIApiKey);
          const newTab = {
            id: Date.now().toString(),
            title: 'Notes',
            content: notes,
            workspaceId,
          };

          globalServices.appStateService.send({ type: 'ADD_TAB', tab: newTab });
          setTimeout(() => {
            navigate(`/${workspaceId}/${newTab.id}`);
          }, 150);
          setUserTranscript('');
          setVoiceRecognitionState('idle');
        }
        break;
    }

    switch (voiceRecognitionState) {
      case 'following': {
        if (!updatedUserTranscript || !elevenlabsKey) return;
        const systemNotes =
          'You are responding via voice synthesis, keep the final answer short and to the point. Answer the users question about this text: ' +
          highlightedText;
        synthesizeAndPlay(fetchResponse(updatedUserTranscript, systemNotes), 'ava');
        break;
      }
      case 'voice2voice': {
        if (!updatedUserTranscript || updatedUserTranscript.split(' ').length < 2) return;
        if (!elevenlabsKey) return;
        synthesizeAndPlay(Promise.resolve(updatedUserTranscript), 'strahl');
        setUserTranscript('');
        break;
      }

      case 'ava':
        synthesizeAndPlay(fetchResponse(updatedUserTranscript, ''), 'ava');
        break;
      case 'strahl':
        synthesizeAndPlay(fetchResponse(updatedUserTranscript, ''), 'strahl');
        break;
      case 'notes':
        setUserTranscript(userTranscript + '\n' + t);
        break;
      case 'idle':
        break;
    }
  };

  useSpeechRecognition({ onTranscriptionComplete, active: true });
  const isOn =
    voiceRecognitionState === 'ava' || voiceRecognitionState === 'notes' || voiceRecognitionState === 'strahl';

  return (
    <>
      {audioContext && <AudioWaveform audioContext={audioContext} isOn={isOn} />}
      {/* <Cursor
        style={{
          visibility: !isOn ? 'hidden' : 'visible',
          display: !isOn ? 'hidden' : '',
        }}
        coordinates={agentCursorPos}
        onReachedDestination={handleReachedDestination}
        speed={1.25}
      /> */}
      <div className="rounded-lg mb-2 items-center justify-between flex-col hidden">
        <div className="w-full flex items-center mb-4">
          <span className="mr-2 text-light">Voice Recognition {voiceRecognitionState}</span>
        </div>
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
      </div>
    </>
  );
};

export default VoiceRecognition;
