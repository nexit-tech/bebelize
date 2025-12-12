'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization, RenderResponse } from '@/types/rendering.types';
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setCustomizations([]);
      setRenderTime(undefined);

      let initialVariantId = null;
      if (item.variants && item.variants.length > 0) {
        initialVariantId = item.variants[0].id;
      }
      setSelectedVariantId(initialVariantId);

      const variant = item.variants?.find(v => v.id === initialVariantId);
      const initialImage = variant?.previewUrl || item.image_url || null;
      
      setPreviewUrl(initialImage);
    }
  }, [isOpen, item]);

  const allLayersForRender = useMemo(() => {
    if (!item) return [];
    if (selectedVariantId && item.variants) {
      const variant = item.variants.find(v => v.id === selectedVariantId);
      if (variant) return variant.layers;
    }
    return item.layers || [];
  }, [item, selectedVariantId]);

  const visualLayers = useMemo(() => {
    return allLayersForRender.filter(layer => layer.type !== 'fixed' && layer.index !== 9999);
  }, [allLayersForRender]);

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setCustomizations([]);

    if (item && item.variants) {
      const variant = item.variants.find(v => v.id === variantId);
      if (variant) {
        setPreviewUrl(variant.previewUrl || item.image_url || null);
      }
    }
  };

  const handleRender = async () => {
    if (!item) return;

    try {
      setIsRendering(true);
      
      const requestBody = {
        item_id: item.id,
        collection_id: item.collection_id,
        customizations,
        layers: allLayersForRender
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
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>Personalizar: {item.name}</h2>
            <span className={styles.subtitle}>
              Selecione as texturas para cada camada
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.layersPanel}>
            
            {item.variants && item.variants.length > 1 && (
              <div className={styles.variantSelector}>
                <label className={styles.variantLabel}>Escolha o Modelo:</label>
                <div className={styles.selectWrapper}>
                  <select 
                    className={styles.variantSelect}
                    value={selectedVariantId || ''}
                    onChange={(e) => handleVariantChange(e.target.value)}
                  >
                    {item.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className={styles.selectIcon} />
                </div>
              </div>
            )}

            <h3 className={styles.panelTitle}>Configurar Camadas</h3>
            {loadingPatterns ? (
              <p style={{ fontSize: '13px', color: '#999' }}>Carregando texturas...</p>
            ) : (
              <LayerCustomizer
                layers={visualLayers}
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