import React from 'react';

interface FloatingButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  handleClick: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ variant, size, label, handleClick }) => {
  return (
    <button
      className="z-10 absolute top-0 left-0 inline-block rounded px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white z-index-10"
      data-te-sidenav-toggle-ref
      data-te-target="#sidenav-1"
      aria-controls="#sidenav-1"
      aria-haspopup="true"
      onClick={handleClick}
    >
      <span className="block [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
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
