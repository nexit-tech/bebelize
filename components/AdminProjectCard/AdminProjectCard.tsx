import React from 'react';
import { FiCalendar, FiUser, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { ProjectStatus } from '@/types';
import { formatDate } from '@/utils';
import StatusTag from '../StatusTag/StatusTag';
import styles from './AdminProjectCard.module.css';

interface AdminProjectCardProps {
  id: string;
  projectName: string;
  clientName: string;
  consultantName: string;
  createdAt: string;
  status: ProjectStatus;
  statusLabel: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AdminProjectCard({
  id,
  projectName,
  clientName,
  consultantName,
  createdAt,
  status,
  statusLabel,
  onView,
  onEdit,
  onDelete
}: AdminProjectCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{projectName}</h3>
        <StatusTag status={status}>{statusLabel}</StatusTag>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.infoItem}>
          <FiUser size={16} className={styles.icon} />
          <span className={styles.infoText}>Cliente: {clientName}</span>
        </div>
        
        <div className={styles.infoItem}>
          <FiUser size={16} className={styles.icon} />
          <span className={styles.infoText}>Consultora: {consultantName}</span>
        </div>

        <div className={styles.infoItem}>
          <FiCalendar size={16} className={styles.icon} />
          <span className={styles.infoText}>{formatDate(createdAt)}</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button 
          className={styles.actionButton}
          onClick={onView}
        >
          <FiEye size={18} />
          <span>Ver</span>
        </button>

        <button 
          className={styles.actionButton}
          onClick={onEdit}
        >
          <FiEdit2 size={18} />
          <span>Editar</span>
        </button>

        <button 
          className={`${styles.actionButton} ${styles.danger}`}
          onClick={onDelete}
        >
          <FiTrash2 size={18} />
          <span>Excluir</span>
        </button>
      </div>
    </div>
  );
}