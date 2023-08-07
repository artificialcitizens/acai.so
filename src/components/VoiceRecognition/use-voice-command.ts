import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { noteChain } from '../../utils/ac-langchain/chains/notes-chain';
import { GlobalStateContext, GlobalStateContextValue } from '../../context/GlobalStateContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toastifyInfo } from '../Toast';
import { Tab } from '../../state';

type VoiceState = 'idle' | 'ava' | 'notes' | 'strahl' | 'voice2voice' | 'following';
type TTSState = 'bark' | 'elevenlabs';

interface Command {
  commands: string[];
  action: (
    setUserTranscript: React.Dispatch<React.SetStateAction<string>>,
    setVoiceRecognitionState: React.Dispatch<React.SetStateAction<VoiceState>>,
    setSynthesisMode?: React.Dispatch<React.SetStateAction<TTSState>>,
  ) => Promise<void> | void;
  toastMessage?: string;
}

export const setStatesAndToast = (
  setUserTranscript: React.Dispatch<React.SetStateAction<string>>,
  setVoiceRecognitionState: React.Dispatch<React.SetStateAction<VoiceState>>,
  transcript: string,
  recognitionState: VoiceState,
  toastMessage?: string,
) => {
  setUserTranscript(transcript);
  setVoiceRecognitionState(recognitionState);
  if (toastMessage) {
    toastifyInfo(toastMessage);
  }
};

export const useVoiceCommands = () => {
  const [userTranscript, setUserTranscript] = useState('');
  const [voiceRecognitionState, setVoiceRecognitionState] = useState<VoiceState>('idle');
  const [synthesisMode, setSynthesisMode] = useState<'bark' | 'elevenlabs'>('bark');
  const globalServices: GlobalStateContextValue = useContext(GlobalStateContext);
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceId = location.pathname.split('/')[1];

  const config: Command[] = [
    {
      commands: ['ava', 'eva'],
      action: (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'ava'),
    },
    {
      commands: ['take notes'],
      action: (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'notes', 'Taking notes'),
    },
    {
      commands: ['voice'],
      action: (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'voice2voice', 'Voice to voice active'),
    },
    {
      commands: ['cancel'],
      action: (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'idle', 'Going Idle'),
    },
    {
      commands: ['hey chris'],
      action: (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'strahl', 'Chris is listening'),
    },
    {
      commands: ['ready'],
      action: async (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => {
        const notes = await noteChain(userTranscript);
        const newTab: Tab = {
          id: Date.now().toString(),
          title: 'Notes',
          content: notes,
          workspaceId,
          filetype: 'markdown',
          systemNote: '',
          isContext: true,
          createdAt: Date.now().toString(),
          lastUpdated: Date.now().toString(),
        };
        globalServices.appStateService.send({ type: 'ADD_TAB', tab: newTab });
        setTimeout(() => {
          navigate(`/${workspaceId}/${newTab.id}`);
        }, 150);
        setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'idle', 'Notes being created');
      },
    },
    {
      commands: ['following'],
      action: (
        setUserTranscript: Dispatch<SetStateAction<string>>,
        setVoiceRecognitionState: Dispatch<SetStateAction<VoiceState>>,
      ) => setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'following', 'Following mode'),
    },
  ];

  const handleVoiceCommand = async (t: string) => {
    const command = config.find((c) => c.commands.includes(t.toLowerCase()));

    if (command) {
      if (command.toastMessage) {
        toastifyInfo(command.toastMessage);
      }
      if (command.action) {
        await command.action(setUserTranscript, setVoiceRecognitionState, setSynthesisMode);
      }
    }
  };

  return {
    userTranscript,
    setUserTranscript,
    voiceRecognitionState,
    setVoiceRecognitionState,
    synthesisMode,
    setSynthesisMode,
    handleVoiceCommand,
  };
};
