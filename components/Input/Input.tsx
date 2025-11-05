import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  id: string;
  required?: boolean;
  inputClassName?: string; // NOVO: Propriedade para classes adicionais no Input
}

export default function Input({
  type,
  placeholder,
  value,
  onChange,
  label,
  id,
  required = false,
  inputClassName = ''
}: InputProps) {
  return (
    <div className={styles.inputContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${inputClassName}`}
        required={required}
      />
    </div>
  );
}