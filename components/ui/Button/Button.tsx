import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size !== 'medium' ? styles[size] : '',
    fullWidth ? styles.fullWidth : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      className={classNames}
      disabled={disabled}
    >
      {children}
    </button>
  );
}