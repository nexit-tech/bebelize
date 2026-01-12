import React from 'react';
import { FiCalendar, FiUser, FiTrash2 } from 'react-icons/fi';
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
  previewImageUrl?: string | null;
  onClick?: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({
  id,
  name,
  clientName,
  createdAt,
  status,
  statusLabel,
  previewImageUrl,
  onClick,
  onDelete
}: ProjectCardProps) {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className={styles.card} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className={styles.previewArea}>
        {previewImageUrl ? (
          <img 
            src={previewImageUrl} 
            alt={`Preview do projeto ${name}`} 
            className={styles.previewImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholderPattern} />
        )}

        {onDelete && (
          <button 
            className={styles.deleteButton}
            onClick={handleDelete}
            title="Excluir projeto"
            type="button"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.projectName} title={name}>
            {name}
          </h3>
          
          <div className={styles.clientInfo}>
            <FiUser size={14} />
            <span>{clientName || 'Cliente sem nome'}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.footer}>
          <div className={styles.date}>
            <FiCalendar size={14} />
            <span>{formatDate(createdAt)}</span>
          </div>
          
          <StatusTag status={status}>
            {statusLabel}
          </StatusTag>
        </div>
      </div>
    </div>
  );
}