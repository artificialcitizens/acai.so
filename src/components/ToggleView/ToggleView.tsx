import React from 'react';

interface ToggleViewProps {
  toggled: boolean;
  handleClick: (e: any) => void;
}

import { SidebarRightIcon, SidebarLeftIcon } from '../Icons/Icons';

export const ToggleView: React.FC<ToggleViewProps> = ({
  toggled,
  handleClick,
}) => {
  return (
    <button
      className="z-10 absolute top-0 right-0 inline-block lg:hidden rounded px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white z-index-10"
      onMouseDown={handleClick}
    >
      <span className="block [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-white">
        {toggled ? <SidebarRightIcon /> : <SidebarLeftIcon />}
      </span>
    </button>
  );
};
