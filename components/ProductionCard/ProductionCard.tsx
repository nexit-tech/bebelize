import React from 'react';
import { FiCalendar, FiUser, FiFileText, FiCheckCircle } from 'react-icons/fi';
import styles from './ProductionCard.module.css';

interface ProductionCardProps {
  id: string;
  projectName: string;
  clientName: string;
  createdAt: string;
  priority: 'normal' | 'urgent';
  onViewDetails: () => void;
  onMarkAsComplete: () => void;
}

export default function ProductionCard({
  id,
  projectName,
  clientName,
  createdAt,
  priority,
  onViewDetails,
  onMarkAsComplete
}: ProductionCardProps) {
  return (
    <div className={`${styles.card} ${priority === 'urgent' ? styles.urgent : ''}`}>
      
      {/* Badge de Prioridade */}
      {priority === 'urgent' && (
        <div className={styles.priorityBadge}>
          <span>Urgente</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{projectName}</h3>
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

      {/* Ações */}
      <div className={styles.cardActions}>
        <button 
          className={styles.actionButton}
          onClick={onViewDetails}
          aria-label="Ver planta de produção"
        >
          <FiFileText size={18} />
          <span>Ver Planta</span>
        </button>

        <button 
          className={`${styles.actionButton} ${styles.primary}`}
          onClick={onMarkAsComplete}
          aria-label="Marcar como finalizado"
        >
          <FiCheckCircle size={18} />
          <span>Finalizar</span>
        </button>
      </div>

    </div>
  );
}