import React from 'react';
import { ProjectStatus } from '@/types';
import styles from './StatusTag.module.css';

interface StatusTagProps {
  status: ProjectStatus;
  size?: 'small' | 'medium';
  children: React.ReactNode;
}

export default function StatusTag({ 
  status, 
  size = 'medium', 
  children 
}: StatusTagProps) {
  
  const classNames = [
    styles.tag,
    styles[status],
    size !== 'medium' ? styles[size] : ''
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      {children}
    </span>
  );
}