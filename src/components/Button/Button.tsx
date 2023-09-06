import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'icon';
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  onClick,
}) => {
  return (
    <button type="button" className={variant} onClick={onClick}>
      {children}
    </button>
  );
};
