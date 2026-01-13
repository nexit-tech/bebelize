import React from 'react';
import { FiCalendar, FiUser, FiTrash2 } from 'react-icons/fi';
import { ProjectStatus } from '@/types';
import { formatDate } from '@/utils';
import StatusTag from '../StatusTag/StatusTag';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  name: string;
  clientName: string;
  createdAt: string;
  status: ProjectStatus;
  statusLabel: string;
  onClick?: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({
  name,
  clientName,
  createdAt,
  status,
  statusLabel,
  onClick,
  onDelete
}: ProjectCardProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div 
      className={styles.card} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {onDelete && (
        <button 
          className={styles.deleteButton} 
          onClick={handleDelete}
          title="Excluir projeto"
          aria-label="Excluir projeto"
        >
          <FiTrash2 size={16} />
        </button>
      )}

      <div className={styles.cardHeader}>
        <h3 className={styles.title} title={name}>{name}</h3>
        <StatusTag status={status} size="small">{statusLabel}</StatusTag>
      </div>

      <div className={styles.metaWrapper}>
        <div className={styles.infoRow}>
          <FiUser size={16} className={styles.icon} />
          <span className={styles.infoLabel}>Cliente:</span>
          <span>{clientName}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.date}>
          <FiCalendar size={14} />
          <span>Criado em {formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}