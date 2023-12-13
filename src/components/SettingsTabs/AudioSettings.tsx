/* eslint-disable jsx-a11y/media-has-caption */
import React, { useContext } from 'react';

import { useElevenlabs } from '../../hooks/use-elevenlabs';
import ScratchPad from '../ScratchPad/ScratchPad';
import { useVoiceCommands } from '../../state/use-voice-command';
import { getToken } from '../../utils/config';
import { toastifyError, toastifyInfo } from '../Toast';
import { useSelector } from '@xstate/react';
import {
  GlobalStateContextValue,
  GlobalStateContext,
} from '../../context/GlobalStateContext';
import Dropdown from '../DropDown';
import { useLocalStorageKeyValue } from '../../hooks/use-local-storage';
import { TTSState, VoiceState } from '../../state/speech.xstate';

export interface AudioSettingsProps {
  handleUpload: (file: string | Blob) => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ handleUpload }) => {
  const { voices } = useElevenlabs();
  const [elevenLabsVoice, setElevenLabsVoice] = useLocalStorageKeyValue(
    'ELEVENLABS_VOICE',
    voices?.[0]?.value,
  );

  const [barkUrl, setBarkUrl] = useLocalStorageKeyValue(
    'BARK_URL',
    import.meta.env.VITE_BARK_SERVER ||
      getToken('BARK_URL') ||
      'http://localhost:5000',
  );

  const [xttsUrl, setXttsUrl] = useLocalStorageKeyValue(
    'XTTS_URL',
    import.meta.env.VITE_XTTS_URL ||
      getToken('XTTS_URL') ||
      'http://localhost:8080',
  );

  const {
    setUserTranscript,
    setVoiceRecognitionState,
    userTranscript,
    voiceRecognitionState,
  } = useVoiceCommands();
  const { speechStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const singleCommand = useSelector(
    speechStateService,
    (state) => state.context.singleCommand,
  );

  const ttsMode = useSelector(
    speechStateService,
    (state) => state.context.ttsMode,
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    speechStateService.send('TOGGLE_SINGLE_COMMAND', {
      singleCommand: event.target.checked,
    });
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
  const handleXttsFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!xttsUrl) {
      toastifyError('Missing Xtts Server URL');
      return;
    }
    setXttsUrl(xttsUrl);
    //@TODO: update to run a test request
    toastifyInfo('Connected to XTTS Server');
  };

  const setTtsMode = (mode: TTSState) => {
    speechStateService.send('SET_TTS_MODE', {
      ttsMode: mode,
    });
  };

  const voiceStateOptions = Object.values(VoiceState).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  let ttsOptions = TTSState.map((value) => ({
    value,
    label:
      value === 'webSpeech'
        ? 'Web Speech API'
        : value.charAt(0).toUpperCase() + value.slice(1),
  }));

  if (!import.meta.env.DEV) {
    ttsOptions = ttsOptions.filter((option) => option.value !== 'bark');
  }

  const handleElevenLabsDropdownChange = (value: string) => {
    setElevenLabsVoice(value);
  };

  return (
    <div
      className={`rounded-lg mb-2 items-center justify-between flex-col flex-grow `}
    >
      <p className="text-acai-white text-sm md:text-xs mb-2 ml-2">
        User Transcript
      </p>
      <ScratchPad
        placeholder="User Transcript"
        readonly
        content={userTranscript}
      />
      <button
        className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 mb-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
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
          checked={singleCommand}
          onChange={handleChange}
        />
      </span>

      <span className="flex flex-col">
        <Dropdown
          label="TTS Engine"
          options={ttsOptions}
          value={ttsMode}
          onChange={(e) => setTtsMode(e as TTSState)}
        />
        {ttsMode === 'elevenlabs' && (
          <Dropdown
            label="Voice"
            options={voices}
            value={elevenLabsVoice || voices?.[0]?.value || ''}
            onChange={handleElevenLabsDropdownChange}
          />
        )}
        {ttsMode === 'bark' && (
          <form className="mb-2" onSubmit={handleBarkFormSubmit}>
            <span className="flex mb-2 items-center">
              <label
                htmlFor="url"
                className="text-acai-white pr-2 w-[50%] ml-2 text-base md:text-xs"
              >
                Bark Server URL:
              </label>
              <input
                id="url"
                className="text-acai-white text-base md:text-sm bg-base px-[2px]"
                value={barkUrl}
                onChange={(e) => setBarkUrl(e.target.value)}
              />
            </span>
            <input
              type="submit"
              value="Connect"
              className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
            />
          </form>
        )}
        {ttsMode === 'xtts' && (
          <>
            <form className="mb-2" onSubmit={handleXttsFormSubmit}>
              <span className="flex mb-2 items-center">
                <label
                  htmlFor="url"
                  className="text-acai-white pr-2 w-[50%] ml-2 text-base md:text-xs"
                >
                  XTTS Server URL:
                </label>
                <input
                  id="url"
                  className="text-acai-white text-base md:text-sm bg-base px-[2px]"
                  value={xttsUrl}
                  onChange={(e) => setXttsUrl(e.target.value)}
                />
              </span>
              <input
                type="submit"
                value="Connect"
                className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
              />
            </form>

            <form className="mb-2" onSubmit={(e) => e.preventDefault()}>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                id="file"
                accept=".wav"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleUpload(file);
                  }
                }}
              />
              <button
                type="button"
                className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
                onClick={handleFileButtonClick}
              >
                Clone Voice
              </button>
            </form>
          </>
        )}
      </span>
    </div>
  );
};
export default AudioSettings;
