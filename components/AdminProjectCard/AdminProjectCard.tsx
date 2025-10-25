import React from 'react';
import { FiCalendar, FiUser, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import StatusTag from '../StatusTag/StatusTag';
import styles from './AdminProjectCard.module.css';

interface AdminProjectCardProps {
  id: string;
  projectName: string;
  clientName: string;
  consultantName: string;
  createdAt: string;
  status: 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado';
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
      
      {/* Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{projectName}</h3>
        <StatusTag status={status}>{statusLabel}</StatusTag>
      </div>

      {/* Informações */}
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
          <span className={styles.infoText}>{createdAt}</span>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.cardActions}>
        <button 
          className={styles.actionButton}
          onClick={onView}
          aria-label="Visualizar projeto"
        >
          <FiEye size={18} />
          <span>Visualizar</span>
        </button>

        <button 
          className={styles.actionButton}
          onClick={onEdit}
          aria-label="Editar projeto"
        >
          <FiEdit2 size={18} />
          <span>Editar</span>
        </button>

        <button 
          className={`${styles.actionButton} ${styles.danger}`}
          onClick={onDelete}
          aria-label="Excluir projeto"
        >
          <FiTrash2 size={18} />
          <span>Excluir</span>
        </button>
      </div>

    </div>
  );
}