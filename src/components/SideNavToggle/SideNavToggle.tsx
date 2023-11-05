import { MenuIcon } from 'lucide-react';
import React from 'react';
import { NavMenuIcon } from '../Icons/Icons';

interface FloatingButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  handleClick: (e: any) => void;
}

export const SideNavToggle: React.FC<FloatingButtonProps> = ({
  variant,
  size,
  label,
  handleClick,
}) => {
  return (
    <button
      className="fixed z-20 rounded-full ml-4 my-2.5 p-1 text-xs font-medium uppercase leading-tight text-acai-white"
      data-te-sidenav-toggle-ref
      data-te-target="#sidenav-1"
      aria-controls="#sidenav-1"
      aria-haspopup="true"
      onMouseDown={handleClick}
    >
      <span className="block [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-4 md:[&>svg]:w-4 [&>svg]:text-acai-white hover:pointer">
        <NavMenuIcon />
      </span>
    </button>
  );
};
