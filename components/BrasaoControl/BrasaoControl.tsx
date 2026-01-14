'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FiUploadCloud, FiTrash2, FiLoader, FiMove, FiMaximize } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BrasaoCustomization } from '@/types/rendering.types';
import styles from './BrasaoControl.module.css';

interface BrasaoControlProps {
  value?: BrasaoCustomization;
  onChange: (value: BrasaoCustomization | undefined) => void;
  itemId: string;
}

const RENDER_BASE_SIZE = 1000;

export default function BrasaoControl({ value, onChange, itemId }: BrasaoControlProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  // Garante que o usuário veja os números atualizados quando arrasta na prévia
  const displayX = value ? Math.round(value.x) : 0;
  const displayY = value ? Math.round(value.y) : 0;
  const displayW = value ? Math.round(value.width) : 0;
  const displayH = value ? Math.round(value.height) : 0;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Apenas arquivos de imagem são permitidos.');
      return;
    }

    try {
      setIsUploading(true);
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `brasao-${itemId}-${timestamp}.${fileExt}`;
      const filePath = `custom-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      const img = new Image();
      img.onload = () => {
        // Define tamanho inicial amigável (20% da base)
        const targetSize = RENDER_BASE_SIZE * 0.20;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        const width = targetSize;
        const height = targetSize / aspectRatio;

        // Centraliza inicialmente
        const x = (RENDER_BASE_SIZE - width) / 2;
        const y = (RENDER_BASE_SIZE - height) / 2;

        onChange({
          url: publicUrl,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height)
        });
        
        setIsUploading(false);
      };

      img.src = publicUrl;

    } catch (error) {
      console.error('Erro upload:', error);
      alert('Erro ao enviar imagem.');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Brasão / Logotipo</h3>
      </div>

      {!value ? (
        <div 
          className={styles.uploadArea}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          {isUploading ? (
            <div className={styles.loadingState}>
              <FiLoader className={styles.spinner} size={24} />
              <span>Processando imagem...</span>
            </div>
          ) : (
            <>
              <div className={styles.iconWrapper}>
                <FiUploadCloud size={24} />
              </div>
              <div className={styles.uploadText}>
                <strong>Clique para enviar</strong>
                <span>PNG ou JPG sem fundo</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.activeCard}>
          <div className={styles.previewSection}>
            <div className={styles.imageWrapper}>
              <img src={value.url} alt="Brasão" />
            </div>
            
            <div className={styles.infoGroup}>
              <div className={styles.coordsRow}>
                <span title="Posição X / Y">
                  <FiMove size={12} /> {displayX}, {displayY}
                </span>
                <span title="Dimensão L x A">
                  <FiMaximize size={12} /> {displayW}x{displayH}
                </span>
              </div>
              <span className={styles.helperText}>
                Arraste na imagem ao lado para ajustar
              </span>
            </div>

            <button 
              className={styles.deleteButton}
              onClick={() => onChange(undefined)}
              title="Remover Brasão"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        style={{ display: 'none' }}
      />
    </div>
  );
}