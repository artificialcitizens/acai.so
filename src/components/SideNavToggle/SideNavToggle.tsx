import { MenuIcon } from 'lucide-react';
import React from 'react';

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
  );
};
