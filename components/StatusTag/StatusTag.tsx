import React from 'react';
import styles from './StatusTag.module.css';

interface StatusTagProps {
  status: 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado';
  children: React.ReactNode;
}

export default function StatusTag({ status, children }: StatusTagProps) {
  return (
    <span className={`${styles.tag} ${styles[status]}`} aria-label={`Status: ${children}`}>
      {children}
    </span>
  );
}