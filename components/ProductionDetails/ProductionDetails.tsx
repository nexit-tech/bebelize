import React from 'react';
import { FiUser, FiCalendar, FiPackage, FiTag } from 'react-icons/fi';
import { ProjectPriority } from '@/types';
import styles from './ProductionDetails.module.css';

interface ProductionDetailsProps {
  projectName: string;
  clientName: string;
  createdAt: string;
  collectionName: string;
  priority: ProjectPriority;
}

export default function ProductionDetails({
  projectName,
  clientName,
  createdAt,
  collectionName,
  priority
}: ProductionDetailsProps) {
  return (
    <div className={styles.detailsContainer}>
      
      <div className={styles.titleRow}>
        <h1 className={styles.projectName}>{projectName}</h1>
        {priority === 'urgente' && (
          <span className={styles.priorityBadge}>Urgente</span>
        )}
      </div>

      <div className={styles.infoGrid}>
        
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <FiUser size={20} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Cliente</span>
            <span className={styles.infoValue}>{clientName}</span>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <FiCalendar size={20} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Data de Criação</span>
            <span className={styles.infoValue}>{createdAt}</span>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <FiPackage size={20} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Coleção</span>
            <span className={styles.infoValue}>{collectionName}</span>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <FiTag size={20} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.infoValue}>Em Produção</span>
          </div>
        </div>

      </div>

    </div>
  );
}