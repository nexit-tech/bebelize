import React from 'react';
import { FiFolderPlus, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styles from './AdminStats.module.css';

interface AdminStatsProps {
  totalProjects: number;
  inNegotiation: number;
  inProduction: number;
  completed: number;
  cancelled: number;
}

export default function AdminStats({
  totalProjects,
  inNegotiation,
  inProduction,
  completed,
  cancelled
}: AdminStatsProps) {
  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FiFolderPlus size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{totalProjects}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.warning}`}>
        <div className={styles.statIcon}>
          <FiClock size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{inNegotiation}</span>
          <span className={styles.statLabel}>Negociação</span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.info}`}>
        <div className={styles.statIcon}>
          <FiClock size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{inProduction}</span>
          <span className={styles.statLabel}>Produção</span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.success}`}>
        <div className={styles.statIcon}>
          <FiCheckCircle size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{completed}</span>
          <span className={styles.statLabel}>Finalizados</span>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.danger}`}>
        <div className={styles.statIcon}>
          <FiXCircle size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue}>{cancelled}</span>
          <span className={styles.statLabel}>Cancelados</span>
        </div>
      </div>
    </div>
  );
}