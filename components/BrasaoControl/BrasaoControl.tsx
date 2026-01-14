'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FiUploadCloud, FiTrash2, FiLoader, FiMove, FiMaximize, FiEdit2 } from 'react-icons/fi';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const displayX = value ? Math.round(value.x) : 0;
  const displayY = value ? Math.round(value.y) : 0;
  const displayW = value ? Math.round(value.width) : 0;
  const displayH = value ? Math.round(value.height) : 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);
    } else {
      setUploadProgress(100);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Apenas arquivos de imagem são permitidos.');
      return;
    }

    try {
      setIsUploading(true); // Oculta a imagem imediatamente
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
        const targetSize = RENDER_BASE_SIZE * 0.20;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        const width = targetSize;
        const height = targetSize / aspectRatio;

        const x = (RENDER_BASE_SIZE - width) / 2;
        const y = (RENDER_BASE_SIZE - height) / 2;

        onChange({
          url: publicUrl,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height)
        });
        
        setIsUploading(false); // Só volta a exibir quando tudo estiver pronto
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

  // Renderização Condicional Estrita
  const renderContent = () => {
    // 1. Prioridade Máxima: Loading
    if (isUploading) {
      return (
        <div className={`${styles.uploadArea} ${styles.uploading}`}>
          <div className={styles.loadingContent}>
            <div className={styles.spinnerWrapper}>
              <svg className={styles.circularLoader} viewBox="25 25 50 50">
                <circle 
                  className={styles.loaderPath} 
                  cx="50" 
                  cy="50" 
                  r="20" 
                  fill="none" 
                  strokeWidth="3" 
                />
              </svg>
              <div className={styles.logoIcon}>
                <FiUploadCloud size={14} />
              </div>
            </div>
            <div className={styles.loadingTextGroup}>
              <span className={styles.loadingTitle}>Processando Imagem</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Estado Ativo (Imagem Carregada)
    if (value) {
      return (
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

            <div className={styles.actions}>
              <button 
                className={styles.editButton}
                onClick={() => fileInputRef.current?.click()}
                title="Trocar Imagem"
              >
                <FiEdit2 size={16} />
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => onChange(undefined)}
                title="Remover Brasão"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Estado Inicial (Upload)
    return (
      <div 
        className={styles.uploadArea}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className={styles.iconCircle}>
          <FiUploadCloud size={20} />
        </div>
        <div className={styles.uploadText}>
          <strong>Clique para fazer upload</strong>
          <span>Formatos PNG ou JPG (sem fundo)</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Brasão / Logotipo</h3>
      </div>

      {renderContent()}

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