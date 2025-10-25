import React from 'react';
import { FiCalendar, FiUser, FiEdit2 } from 'react-icons/fi';
import StatusTag from '../StatusTag/Statustag';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  id: string;
  name: string;
  clientName: string;
  createdAt: string;
  status: 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado';
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
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      
      {/* Header do Card */}
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{name}</h3>
        <StatusTag status={status}>{statusLabel}</StatusTag>
      </div>

      {/* Informações */}
      <div className={styles.cardInfo}>
        <div className={styles.infoItem}>
          <FiUser size={16} className={styles.icon} />
          <span className={styles.infoText}>{clientName}</span>
        </div>
        
        <div className={styles.infoItem}>
          <FiCalendar size={16} className={styles.icon} />
          <span className={styles.infoText}>{createdAt}</span>
        </div>
      </div>

      {/* Footer do Card */}
      <div className={styles.cardFooter}>
        <button className={styles.editButton} aria-label="Editar projeto">
          <FiEdit2 size={16} />
          <span>Editar</span>
        </button>
      </div>

    </div>
  );
}