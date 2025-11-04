import React from 'react';
import { FiCalendar, FiUser, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { ProjectPriority } from '@/types';
import { formatDate } from '@/utils';
import styles from './ProductionCard.module.css';

interface ProductionCardProps {
  id: string;
  projectName: string;
  clientName: string;
  createdAt: string;
  priority: ProjectPriority;
  onViewDetails: () => void;
  onMarkAsComplete: () => void;
}

export default function ProductionCard({
  projectName,
  clientName,
  createdAt,
  priority,
  onViewDetails,
  onMarkAsComplete
}: ProductionCardProps) {
  return (
    <div className={`${styles.card} ${priority === 'urgente' ? styles.urgent : ''}`}>
      {priority === 'urgente' && (
        <div className={styles.priorityBadge}>
          <span>Urgente</span>
        </div>
      )}

      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{projectName}</h3>
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

      <div className={styles.cardActions}>
        <button className={styles.actionButton} onClick={onViewDetails}>
          <FiFileText size={18} />
          <span>Ver Planta</span>
        </button>

        <button className={`${styles.actionButton} ${styles.primary}`} onClick={onMarkAsComplete}>
          <FiCheckCircle size={18} />
          <span>Finalizar</span>
        </button>
      </div>
    </div>
  );
}