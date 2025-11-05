import React from 'react';
import styles from './ProjectDetailCard.module.css';

interface DetailItem {
  label: string;
  value: string;
  render?: React.ReactNode;
}

interface ProjectDetailCardProps {
  title: string;
  items: DetailItem[];
}

export default function ProjectDetailCard({ title, items }: ProjectDetailCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.detailsGrid}>
        {items.map((item, index) => (
          <div key={index} className={styles.detailItem}>
            <span className={styles.detailLabel}>{item.label}:</span>
            {item.render ? (
              item.render
            ) : (
              <span className={styles.detailValue}>{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}