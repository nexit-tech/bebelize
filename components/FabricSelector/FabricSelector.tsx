import React from 'react';
import styles from './FabricSelector.module.css';

interface FabricOption {
  id: string;
  name: string;
  texture: string;
}

interface FabricSelectorProps {
  fabrics: FabricOption[];
  selectedFabric: string;
  onSelect: (fabricId: string) => void;
}

export default function FabricSelector({ fabrics, selectedFabric, onSelect }: FabricSelectorProps) {
  return (
    <div className={styles.fabricContainer}>
      <label className={styles.label}>Tecido</label>
      <div className={styles.fabricGrid}>
        {fabrics.map((fabric) => (
          <button
            key={fabric.id}
            className={`${styles.fabricOption} ${
              selectedFabric === fabric.id ? styles.selected : ''
            }`}
            onClick={() => onSelect(fabric.id)}
            aria-label={`Selecionar tecido ${fabric.name}`}
            aria-pressed={selectedFabric === fabric.id}
          >
            <div 
              className={styles.fabricPreview} 
              style={{ backgroundImage: `url(${fabric.texture})` }} 
            />
            <span className={styles.fabricName}>{fabric.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}