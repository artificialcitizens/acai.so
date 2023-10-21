import React from 'react';

interface AvaSettingsProps {
  toggled: boolean;
  handleClick: (e: any) => void;
}

import { SidebarRightIcon, SidebarLeftIcon, SettingIcon } from '../Icons/Icons';

export const AvaNav: React.FC<AvaSettingsProps> = ({
  toggled,
  handleClick,
}) => {
  return (
    <div className="z-10 absolute top-0 right-0 flex">
      <button
        className="inline-block rounded mr-4 py-2.5 text-xs font-medium uppercase leading-tight text-white z-index-10 "
        onMouseDown={handleClick}
      >
        <span className="block [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-4 md:[&>svg]:w-4 [&>svg]:text-acai-white hover:pointer">
          <SettingIcon />
        </span>
      </button>
      <button
        className="inline-block rounded mr-6 py-2.5 text-xs font-medium uppercase leading-tight text-white z-index-10 "
        onMouseDown={handleClick}
      >
        <span className="block [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-4 md:[&>svg]:w-4 [&>svg]:text-acai-white hover:pointer">
          {toggled ? <SidebarRightIcon /> : <SidebarLeftIcon />}
        </span>
      </button>
    </div>
  );
};
