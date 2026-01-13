import React from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { ProjectStatus } from '@/types';
import { formatDate } from '@/utils';
import StatusTag from '../StatusTag/StatusTag';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  id: string;
  name: string;
  clientName: string;
  createdAt: string;
  status: ProjectStatus;
  statusLabel: string;
  onClick?: () => void;
}

export default function ProjectCard({
  id,
  name,
  clientName,
  createdAt,
  status,
  statusLabel,
  onClick
}: ProjectCardProps) {
  return (
    <div 
      className={styles.card} 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{name}</h3>
        <StatusTag status={status}>{statusLabel}</StatusTag>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.infoItem}>
          <FiUser size={16} className={styles.icon} />
          <span className={styles.infoText}>{clientName}</span>
        </div>
        
        <div className={styles.infoItem}>
          <FiCalendar size={16} className={styles.icon} />
          <span className={styles.infoText}>{formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}