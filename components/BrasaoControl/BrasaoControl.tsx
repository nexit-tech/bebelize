'use client';

import React, { useRef, ChangeEvent } from 'react';
import { FiUpload, FiTrash2, FiMove, FiMaximize, FiRotateCw } from 'react-icons/fi';
import { BrasaoCustomization } from '@/types/rendering.types';
import Button from '../Button/Button';
import styles from './BrasaoControl.module.css';

interface BrasaoControlProps {
  value: BrasaoCustomization | undefined;
  onChange: (value: BrasaoCustomization | undefined) => void;
  itemId: string;
}

export default function BrasaoControl({
  value,
  onChange,
  itemId
}: BrasaoControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange({
          url: event.target.result as string,
          x: 400,
          y: 400,
          width: 200,
          height: 200,
          rotation: 0
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const updateField = (field: keyof BrasaoCustomization, newValue: number) => {
    if (!value) return;
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(undefined);
  };

  if (!value) {
    return (
      <div className={styles.emptyState}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleUpload}
          id="brasao-upload"
        />
        <label htmlFor="brasao-upload" className={styles.uploadButton}>
          <div className={styles.iconCircle}>
            <FiUpload size={24} />
          </div>
          <span className={styles.uploadText}>Enviar imagem do brasão</span>
          <span className={styles.uploadSubtext}>Suporta PNG com fundo transparente</span>
        </label>
      </div>
    );
  }

  return (
    <div className={styles.controlCard}>
      <div className={styles.cardHeader}>
        <div className={styles.previewWrapper}>
          <img 
            src={value.url} 
            alt="Brasão" 
            className={styles.previewImage}
            style={{ transform: `rotate(${value.rotation || 0}deg)` }} 
          />
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.fileName}>Brasão Aplicado</span>
          <button onClick={handleRemove} className={styles.removeLink}>
            <FiTrash2 size={14} /> Remover
          </button>
        </div>
      </div>

      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <FiRotateCw size={14} />
            <label>Rotação</label>
            <span className={styles.valueDisplay}>{Math.round(value.rotation || 0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={value.rotation || 0}
            onChange={(e) => updateField('rotation', Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <FiMaximize size={14} />
            <label>Tamanho</label>
            <span className={styles.valueDisplay}>{Math.round(value.width)}px</span>
          </div>
          <input
            type="range"
            min="50"
            max="800"
            value={value.width}
            onChange={(e) => {
              const newWidth = Number(e.target.value);
              const ratio = value.height / value.width;
              onChange({
                ...value,
                width: newWidth,
                height: newWidth * (Number.isNaN(ratio) ? 1 : ratio)
              });
            }}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <FiMove size={14} />
            <label>Posição X (Horizontal)</label>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            value={value.x}
            onChange={(e) => updateField('x', Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.labelRow}>
            <FiMove size={14} className={styles.rotateIcon} />
            <label>Posição Y (Vertical)</label>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            value={value.y}
            onChange={(e) => updateField('y', Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>
    </div>
  );
}