/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';

import { useVoiceCommands } from '../../state/use-voice-command';

import Dropdown from '../DropDown';
import { VoiceState } from '../../state/speech.xstate';

const AudioSettings: React.FC = () => {
  const {
    setUserTranscript,
    setVoiceRecognitionState,
    userTranscript,
    voiceRecognitionState,
  } = useVoiceCommands();
  const handleVoiceStateChange = (voiceState: VoiceState) => {
    setVoiceRecognitionState(voiceState);
  };

  const voiceStateOptions = Object.values(VoiceState).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  return (
    <div className={`rounded-lg mb-2 items-center justify-between flex-col`}>
      <hr />
      <Dropdown
        label="Synthesis Mode"
        options={voiceStateOptions}
        value={voiceRecognitionState}
        onChange={(e) => handleVoiceStateChange(e as VoiceState)}
      />

      {/* <p className="text-acai-white text-sm md:text-xs mb-2 ml-2">
        User Transcript
      </p>
      <ScratchPad
        placeholder="User Transcript"
        readonly
        content={userTranscript}
      />
      <button
        className="bg-light text-sm md:text-xs text-acai-white px-4 py-2 mb-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer max-h-[25vh]"
        type="button"
        onClick={() => {
          setUserTranscript('');
        }}
      >
        Clear Transcript
      </button> */}
    </div>
  );
};

export default AudioSettings;
