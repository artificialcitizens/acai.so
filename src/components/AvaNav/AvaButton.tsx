import React from 'react';

interface AvaButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick: () => void;
}

const AvaButton: React.FC<AvaButtonProps> = ({
  className,
  children,
  onClick,
}) => {
  const combinedClass =
    'inline-block rounded-full mr-4 my-2.5 p-1 text-xs font-medium uppercase leading-tight text-white z-index-10 ' +
    className;

  return (
    <button className={combinedClass} onMouseDown={() => onClick()}>
      <span className="block [&>svg]:h-5 [&>svg]:w-5 md:[&>svg]:h-4 md:[&>svg]:w-4 [&>svg]:text-acai-white hover:pointer">
        {children}
      </span>
    </button>
  );
};

export default AvaButton;
