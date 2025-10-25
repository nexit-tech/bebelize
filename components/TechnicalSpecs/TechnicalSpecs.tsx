import React from 'react';
import styles from './TechnicalSpecs.module.css';

interface Specification {
  label: string;
  value: string;
  code?: string;
}

interface TechnicalSpecsProps {
  specifications: Specification[];
}

export default function TechnicalSpecs({ specifications }: TechnicalSpecsProps) {
  return (
    <div className={styles.specsContainer}>
      <h2 className={styles.title}>Especificações Técnicas</h2>
      <p className={styles.subtitle}>Informações precisas para produção</p>

      <div className={styles.specsList}>
        {specifications.map((spec, index) => (
          <div key={index} className={styles.specItem}>
            <div className={styles.specHeader}>
              <span className={styles.specLabel}>{spec.label}</span>
              {spec.code && (
                <span className={styles.specCode}>#{spec.code}</span>
              )}
            </div>
            <span className={styles.specValue}>{spec.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.warningBox}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningContent}>
          <p className={styles.warningTitle}>Atenção</p>
          <p className={styles.warningText}>
            Todos os códigos e especificações devem ser seguidos rigorosamente.
            Em caso de dúvida, consulte o supervisor antes de iniciar a produção.
          </p>
        </div>
      </div>
    </div>
  );
}