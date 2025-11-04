import React from 'react';
import { FiPackage, FiClock } from 'react-icons/fi';
import styles from './ProductionHeader.module.css';

interface ProductionHeaderProps {
  totalProjects: number;
  urgentProjects: number;
}

export default function ProductionHeader({ 
  totalProjects, 
  urgentProjects 
}: ProductionHeaderProps) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FiPackage size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{totalProjects}</span>
          <span className={styles.statLabel}>Em Produção</span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.urgent}`}>
        <div className={styles.statIcon}>
          <FiClock size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{urgentProjects}</span>
          <span className={styles.statLabel}>Urgentes</span>
        </div>
      </div>
    </div>
  );
}