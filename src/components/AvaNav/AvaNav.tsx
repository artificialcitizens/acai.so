import React, { useContext } from 'react';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import Settings from '../SettingsTabs/SettingsTabs';

interface AvaSettingsProps {
  toggled: boolean;
  handleClick: () => void;
}

import {
  SidebarRightIcon,
  SidebarLeftIcon,
  SettingIcon,
  MicIcon,
  KnowledgeIcon,
} from '../Icons/Icons';
import { useSelector } from '@xstate/react';
import AvaButton from './AvaButton';

export const AvaNav: React.FC<AvaSettingsProps> = ({
  toggled,
  handleClick,
}) => {
  const { uiStateService, speechStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const micRecording = useSelector(
    speechStateService,
    (state) => state.context.micRecording,
  );

  const handleToggleMic = () => {
    speechStateService.send('TOGGLE_MIC_RECORDING', {
      micRecording: !micRecording,
    });

    if (micRecording) {
      speechStateService.send('SET_VOICE_STATE', {
        voiceState: 'idle',
      });
    }
  };
  const openModal = (content: string | React.ReactNode) =>
    uiStateService.send({ type: 'TOGGLE_MODAL', modalContent: content });

  const openSettings = (index?: number) =>
    openModal(<Settings initialTabIndex={index || 0} />);

  return (
    <div className="z-10 fixed top-0 right-0 flex">
      <AvaButton
        className={micRecording ? 'bg-acai' : ''}
        onClick={handleToggleMic}
      >
        <MicIcon />
      </AvaButton>
      <AvaButton onClick={() => openSettings(1)}>
        <KnowledgeIcon />
      </AvaButton>
      <AvaButton onClick={() => openSettings()}>
        <SettingIcon />
      </AvaButton>
      <AvaButton onClick={handleClick}>
        {toggled ? <SidebarRightIcon /> : <SidebarLeftIcon />}
      </AvaButton>
    </div>
  );
};
