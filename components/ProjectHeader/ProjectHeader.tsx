import React from 'react';
import { FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import StatusTag from '../StatusTag/StatusTag';
import styles from './ProjectHeader.module.css';

interface ProjectHeaderProps {
  projectName: string;
  clientName: string;
  createdAt: string;
  status: 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado';
  statusLabel: string;
}

export default function ProjectHeader({
  projectName,
  clientName,
  createdAt,
  status,
  statusLabel
}: ProjectHeaderProps) {
  return (
    <div className={styles.headerContainer}>
      
      {/* Título e Status */}
      <div className={styles.titleRow}>
        <h1 className={styles.projectName}>{projectName}</h1>
        <StatusTag status={status}>{statusLabel}</StatusTag>
      </div>

      {/* Informações */}
      <div className={styles.infoRow}>
        <div className={styles.infoItem}>
          <FiUser size={16} className={styles.icon} />
          <span className={styles.infoText}>Cliente: {clientName}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.infoItem}>
          <FiCalendar size={16} className={styles.icon} />
          <span className={styles.infoText}>Criado em: {createdAt}</span>
        </div>
      </div>

    </div>
  );
}