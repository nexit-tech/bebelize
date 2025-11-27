'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization, RenderRequest, RenderResponse } from '@/types/rendering.types';
import { useDiscoveredPatterns } from '@/hooks/useDiscoveredPatterns';
import Button from '../Button/Button';
import LayerCustomizer from '../LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '../ProjectRenderer/ProjectRenderer';
import styles from './ItemCustomizerModal.module.css';

interface ItemCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DiscoveredItem | null;
  onAddToProject: (item: DiscoveredItem, customizations: LayerCustomization[], renderUrl: string) => void;
}

export default function ItemCustomizerModal({
  isOpen,
  onClose,
  item,
  onAddToProject
}: ItemCustomizerModalProps) {
  const { patterns, isLoading: loadingPatterns } = useDiscoveredPatterns();
  
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setCustomizations([]);
      setPreviewUrl(null);
      setRenderTime(undefined);
    }
  }, [isOpen, item]);

  const handleRender = async () => {
    if (!item) return;

    try {
      setIsRendering(true);
      
      const requestBody = {
        item_id: item.id,
        collection_id: item.collection_id,
        customizations,
        layers: item.layers
      };

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: RenderResponse = await response.json();

      if (data.success) {
        setPreviewUrl(data.preview_url);
        setRenderTime(data.render_time_ms);
      } else {
        alert(`Erro ao renderizar: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Falha na comunicação com o servidor de renderização.');
    } finally {
      setIsRendering(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Personalizar: {item.name}</h2>
            <span style={{ fontSize: '13px', color: '#A69A94' }}>
              Selecione as texturas para cada camada
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.layersPanel}>
            <h3 className={styles.panelTitle}>Configurar Camadas</h3>
            {loadingPatterns ? (
              <p style={{ fontSize: '13px', color: '#999' }}>Carregando texturas...</p>
            ) : (
              <LayerCustomizer
                layers={item.layers || []}
                patterns={patterns}
                customizations={customizations}
                onCustomizationsChange={setCustomizations}
              />
            )}
          </div>

          <div className={styles.previewPanel}>
            <ProjectRenderer
              previewUrl={previewUrl}
              isRendering={isRendering}
              onRender={handleRender}
              renderTime={renderTime}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => item && previewUrl && onAddToProject(item, customizations, previewUrl)}
            disabled={!previewUrl || isRendering}
          >
            Adicionar ao Projeto
          </Button>
        </div>
      </div>
    </div>
  );
}