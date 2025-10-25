import React from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './ColorSwatch.module.css';

interface ColorSwatchProps {
  color: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export default function ColorSwatch({ color, label, selected = false, onClick }: ColorSwatchProps) {
  return (
    <button
      className={`${styles.swatch} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      aria-label={`Selecionar cor ${label}`}
      aria-pressed={selected}
    >
      <div className={styles.colorCircle} style={{ backgroundColor: color }}>
        {selected && (
          <div className={styles.checkIcon}>
            <FiCheck size={16} color="#FFFFFF" />
          </div>
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </button>
  );
}