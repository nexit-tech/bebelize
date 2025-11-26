'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization, RenderRequest, RenderResponse } from '@/types/rendering.types';
import { usePatterns } from '@/hooks/usePatterns';
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
  const { patterns } = usePatterns();
  
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);

  // Resetar estado quando o modal abre com um novo item
  useEffect(() => {
    if (isOpen) {
      setCustomizations([]);
      setPreviewUrl(null);
      setRenderTime(undefined);
    }
  }, [isOpen, item]);

  const handleCustomizationChange = (newCustomizations: LayerCustomization[]) => {
    setCustomizations(newCustomizations);
    // Opcional: Limpar preview anterior quando mudar algo, para forçar novo render
    // setPreviewUrl(null); 
  };

  const handleRender = async () => {
    if (!item || customizations.length === 0) return;

    try {
      setIsRendering(true);
      
      const request: RenderRequest = {
        item_id: item.id,
        collection_id: item.collection_id,
        customizations
      };

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data: RenderResponse = await response.json();

      if (data.success) {
        setPreviewUrl(data.preview_url);
        setRenderTime(data.render_time_ms);
      } else {
        alert('Erro ao gerar renderização: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Render error:', error);
      alert('Falha na comunicação com o servidor de renderização');
    } finally {
      setIsRendering(false);
    }
  };

  const handleConfirm = () => {
    if (item && previewUrl) {
      onAddToProject(item, customizations, previewUrl);
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Personalizar: {item.name}</h2>
            <span style={{ fontSize: '13px', color: '#A69A94' }}>
              Configure as camadas à esquerda e gere o preview
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose} title="Fechar">
            <FiX size={24} />
          </button>
        </div>

        {/* Body: Grid de 2 Colunas */}
        <div className={styles.body}>
          
          {/* Esquerda: Controles */}
          <div className={styles.layersPanel}>
            <h3 className={styles.panelTitle}>Configurar Camadas</h3>
            <LayerCustomizer
              layers={item.layers || []}
              patterns={patterns}
              customizations={customizations}
              onCustomizationsChange={handleCustomizationChange}
            />
          </div>

          {/* Direita: Preview */}
          <div className={styles.previewPanel}>
            <ProjectRenderer
              previewUrl={previewUrl}
              isRendering={isRendering}
              onRender={handleRender}
              renderTime={renderTime}
            />
          </div>
        </div>

        {/* Footer: Ações */}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={!previewUrl || isRendering}
          >
            Adicionar ao Projeto
          </Button>
        </div>

      </div>
    </div>
  );
}