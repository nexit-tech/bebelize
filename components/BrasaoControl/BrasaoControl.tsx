import React, { useState } from 'react';
import { FiUpload, FiTrash2, FiCheckSquare, FiSquare, FiInfo } from 'react-icons/fi';
import { supabase } from '@/lib/supabase/client';
import styles from './BrasaoControl.module.css';
import type { BrasaoCustomization } from '@/types/rendering.types';

interface BrasaoControlProps {
  value?: BrasaoCustomization;
  onChange: (value: BrasaoCustomization | undefined) => void;
  itemId: string;
}

export default function BrasaoControl({ value, onChange, itemId }: BrasaoControlProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isActive = !!value;

  const handleToggle = (active: boolean) => {
    if (active) {
      onChange({
        url: '',
        x: 800, 
        y: 600,
        width: 400,
        height: 400
      });
    } else {
      onChange(undefined);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${itemId}-brasao-${Date.now()}.${fileExt}`;
      const filePath = `custom-uploads/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('projects')
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      onChange({
        ...(value || { x: 800, y: 600, width: 400, height: 400 }),
        url: data.publicUrl
      });

    } catch (error: any) {
      console.error('Erro no upload do brasão:', error);
      setUploadError('Falha ao enviar imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.header} ${isActive ? styles.headerActive : ''}`}
        onClick={() => handleToggle(!isActive)}
      >
        <div className={styles.checkbox}>
          {isActive ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
        </div>
        <span className={styles.title}>Adicionar Brasão/Logo</span>
      </div>

      {isActive && value && (
        <div className={styles.controls}>
          <div className={styles.uploadSection}>
            {value.url ? (
              <div className={styles.previewContainer}>
                <img src={value.url} alt="Brasão" className={styles.miniPreview} />
                <div className={styles.previewActions}>
                  <span className={styles.fileName}>Imagem carregada</span>
                  <div className={styles.actionButtons}>
                    <label className={styles.changeLabel}>
                      Trocar imagem
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg" 
                        onChange={handleUpload}
                        hidden 
                      />
                    </label>
                    <button 
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => onChange({ ...value, url: '' })}
                    >
                      <FiTrash2 size={14} /> Remover
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className={styles.uploadArea}>
                {isUploading ? (
                  <span className={styles.loadingText}>Enviando...</span>
                ) : (
                  <>
                    <FiUpload size={24} />
                    <span>Clique para enviar (PNG/JPG)</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/png,image/jpeg" 
                  onChange={handleUpload}
                  disabled={isUploading}
                  hidden 
                />
              </label>
            )}
            
            {uploadError && <p className={styles.errorText}>{uploadError}</p>}
            
            <div className={styles.infoBox}>
              <FiInfo size={14} />
              <p>Arraste e redimensione o brasão diretamente sobre a imagem do produto ao lado.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}