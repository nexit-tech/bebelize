import React from 'react';
import { ProjectStatus } from '@/types';
import styles from './StatusTag.module.css';

interface StatusTagProps {
  status: ProjectStatus;
  children: React.ReactNode;
}

export default function StatusTag({ status, children }: StatusTagProps) {
  return (
    <span className={`${styles.tag} ${styles[status]}`}>
      {children}
    </span>
  );
}