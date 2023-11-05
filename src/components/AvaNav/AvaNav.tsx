/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useRef } from 'react';
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
  FolderIcon,
} from '../Icons/Icons';
import { useSelector } from '@xstate/react';
import AvaButton from './AvaButton';
import DropdownSettings from './Settings';
import { useClickAway } from '@uidotdev/usehooks';

export const AvaNav: React.FC<AvaSettingsProps> = ({
  toggled,
  handleClick,
}) => {
  const { uiStateService, speechStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const micRecording = useSelector(
    speechStateService,
    (state) => state.context.micRecording,
  );
  const navOpenRef = useRef(false);
  navOpenRef.current = settingsOpen;

  const ref = useClickAway(() => {
    if (!navOpenRef.current) return;
    setSettingsOpen(false);
  });

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
      <div className="relative inline-block text-left" ref={ref}>
        <div>
          <AvaButton onClick={() => setSettingsOpen(!settingsOpen)}>
            <FolderIcon />
          </AvaButton>
        </div>

        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-light shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          style={{ display: settingsOpen ? 'block' : 'none' }}
          tabIndex={-1}
        >
          <DropdownSettings onClose={() => setSettingsOpen(false)} />
        </div>
      </div>
      <AvaButton onClick={() => openSettings()}>
        <SettingIcon />
      </AvaButton>
      <AvaButton
        className={micRecording ? 'bg-acai' : ''}
        onClick={handleToggleMic}
      >
        <MicIcon />
      </AvaButton>
      <AvaButton onClick={() => openSettings(1)}>
        <KnowledgeIcon />
      </AvaButton>

      <AvaButton onClick={handleClick}>
        {toggled ? <SidebarRightIcon /> : <SidebarLeftIcon />}
      </AvaButton>
    </div>
  );
};
