import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { noteChain } from '../../lib/ac-langchain/chains/notes-chain';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toastifyInfo } from '../Toast';
import { ACDoc } from '../../state';
import { VoiceState, TTSState } from '../../state/speech.xstate';
import { useSelector } from '@xstate/react';

interface Command {
  commands: string[];
  action: (
    setUserTranscript: (transcript: string) => void,
    setVoiceRecognitionState: (recognitionState: VoiceState) => void,
    setSynthesisMode?: (synthesisMode: TTSState) => void,
  ) => Promise<void> | void;
  toastMessage?: string;
}

export const setStatesAndToast = (
  setUserTranscript: (transcript: string) => void,
  setVoiceRecognitionState: (recognitionState: VoiceState) => void,
  transcript: string,
  recognitionState: VoiceState,
) => {
  setUserTranscript(transcript);
  setVoiceRecognitionState(recognitionState);
};

export const useVoiceCommands = () => {
  const navigate = useNavigate();
  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const { speechStateService, appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const voiceState = useSelector(
    speechStateService,
    (state) => state.context.voiceState,
  );

  const userTranscript = useSelector(
    speechStateService,
    (state) => state.context.userTranscript,
  );

  const ttsMode = useSelector(
    speechStateService,
    (state) => state.context.ttsMode,
  );

  const workspaceId = rawWorkspaceId || 'docs';

  const setUserTranscript = (transcript: string) => {
    speechStateService.send('SET_USER_TRANSCRIPT', {
      userTranscript: transcript,
    });
  };

  const setTtsMode = (synthesisMode: TTSState) => {
    speechStateService.send('SET_TTS_MODE', {
      ttsMode: synthesisMode,
    });
  };

  const setVoiceRecognitionState = (recognitionState: VoiceState) => {
    speechStateService.send('SET_VOICE_STATE', {
      voiceState: recognitionState,
    });
  };

  const createCommand = ({
    commands,
    recognitionState,
    toastMessage,
    action,
  }: {
    commands: string[];
    recognitionState: VoiceState;
    toastMessage?: string;
    action?: (
      setUserTranscript: (transcript: string) => void,
      setVoiceRecognitionState: (recognitionState: VoiceState) => void,
      setSynthesisMode?: (synthesisMode: TTSState) => void,
    ) => Promise<void> | void;
  }): Command => ({
    commands,
    action:
      action ||
      ((setUserTranscript, setVoiceRecognitionState) =>
        setStatesAndToast(
          setUserTranscript,
          setVoiceRecognitionState,
          '',
          recognitionState,
        )),
    toastMessage,
  });

  // Handler function for 'ready' command, used when finished creating notes
  const handleReadyCommand = async (
    setUserTranscript: (transcript: string) => void,
    setVoiceRecognitionState: (recognitionState: VoiceState) => void,
  ) => {
    const notes = await noteChain(userTranscript);
    const newTab: ACDoc = {
      id: Date.now().toString(),
      title: 'Notes',
      content: notes,
      workspaceId,
      filetype: 'markdown',
      autoSave: true,
      canEdit: true,
      systemNote: '',
      isContext: true,
      createdAt: Date.now().toString(),
      lastUpdated: Date.now().toString(),
    };
    appStateService.send({ type: 'ADD_TAB', tab: newTab });
    setTimeout(() => {
      navigate(`/${workspaceId}/documents/${newTab.id}`);
    }, 150);
    setStatesAndToast(setUserTranscript, setVoiceRecognitionState, '', 'idle');
  };

  /**
   * commands: Array of strings that will trigger the command
   * recognitionState: The state that the voice recognition will be set to when the command is triggered
   * toastMessage: The message that will be displayed in the toast
   * action: The function that will be called when the command is triggered
   */
  const config: Command[] = [
    createCommand({
      commands: ['ava', 'eva'],
      recognitionState: 'ava',
      toastMessage: 'Agent is listening',
    }),
    createCommand({
      commands: ['take notes'],
      recognitionState: 'notes',
      toastMessage: 'Taking notes',
    }),
    createCommand({
      commands: ['voice'],
      recognitionState: 'voice',
      toastMessage: 'Voice to voice active',
    }),
    createCommand({
      commands: ['cancel'],
      recognitionState: 'idle',
      toastMessage: 'Going Idle',
    }),
    createCommand({
      commands: ['ready'],
      recognitionState: 'idle',
      toastMessage: 'Notes being created',
      action: handleReadyCommand,
    }),
  ];

  const handleVoiceCommand = async (t: string) => {
    const command = config.find((c) => c.commands.includes(t.toLowerCase()));

    if (command) {
      if (command.toastMessage) {
        toastifyInfo(command.toastMessage);
      }
      if (command.action) {
        await command.action(
          setUserTranscript,
          setVoiceRecognitionState,
          setTtsMode,
        );
      }
    }
  };

  return {
    userTranscript,
    setUserTranscript,
    voiceRecognitionState: voiceState,
    setVoiceRecognitionState,
    ttsMode,
    setSynthesisMode: setTtsMode,
    handleVoiceCommand,
  };
};
