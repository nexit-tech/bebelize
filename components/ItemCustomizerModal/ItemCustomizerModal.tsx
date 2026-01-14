'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiChevronDown, FiBox, FiCheckCircle } from 'react-icons/fi';
import type { DiscoveredItem, DiscoveredPattern } from '@/lib/discovery/types';
import type { LayerCustomization, RenderResponse, BrasaoCustomization } from '@/types/rendering.types';
import { useDiscoveredPatterns } from '@/hooks/useDiscoveredPatterns';
import Button from '../Button/Button';
import LayerCustomizer from '../LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '../ProjectRenderer/ProjectRenderer';
import BrasaoControl from '../BrasaoControl/BrasaoControl';
import styles from './ItemCustomizerModal.module.css';

interface ItemCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DiscoveredItem | null;
  initialCustomizations?: LayerCustomization[];
  initialBrasao?: BrasaoCustomization;
  initialPreviewUrl?: string | null;
  initialVariantId?: string | null;
  onAddToProject: (
    item: DiscoveredItem, 
    customizations: LayerCustomization[], 
    renderUrl: string, 
    variantId?: string,
    brasao?: BrasaoCustomization
  ) => void;
}

export default function ItemCustomizerModal({
  isOpen,
  onClose,
  item,
  initialCustomizations,
  initialBrasao,
  initialPreviewUrl,
  initialVariantId,
  onAddToProject
}: ItemCustomizerModalProps) {
  const { patterns, isLoading: loadingPatterns } = useDiscoveredPatterns();
  
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [brasao, setBrasao] = useState<BrasaoCustomization | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      if (initialCustomizations) {
        setCustomizations(initialCustomizations);
        setBrasao(initialBrasao);
        setPreviewUrl(initialPreviewUrl || item.image_url || null);
        setSelectedVariantId(initialVariantId || (item.variants?.[0]?.id || null));
      } else {
        setCustomizations([]);
        setBrasao(undefined);
        const firstVariantId = item.variants?.[0]?.id || null;
        setSelectedVariantId(firstVariantId);
        
        const variant = item.variants?.find(v => v.id === firstVariantId);
        setPreviewUrl(variant?.previewUrl || item.image_url || null);
      }
      setRenderTime(undefined);
    }
  }, [isOpen, item, initialCustomizations, initialBrasao, initialPreviewUrl, initialVariantId]);

  const adaptedPatterns: DiscoveredPattern[] = useMemo(() => {
    return patterns.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      file: p.file || '',
      url: p.url,
      thumbnail_url: p.thumbnail_url || p.url
    }));
  }, [patterns]);

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
    if (!item) return null;

    try {
      setIsRendering(true);
      
      const requestBody = {
        item_id: item.id,
        variant_id: selectedVariantId,
        collection_id: item.collection_id,
        customizations,
        layers: allLayersForRender,
        brasao
      };

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

      const data: RenderResponse = await response.json();

      if (data.success) {
        const finalUrl = `${data.preview_url}?t=${Date.now()}`;
        setPreviewUrl(finalUrl);
        setRenderTime(data.render_time_ms);
        return finalUrl;
      } else {
        alert(`Erro ao renderizar: ${data.error}`);
        return null;
      }
    } catch (error) {
      console.error(error);
      alert('Falha na comunicação com o servidor de renderização.');
      return null;
    } finally {
      setIsRendering(false);
    }
  };

  const handleConfirm = async () => {
    if (!item) return;

    try {
      setIsSaving(true);
      const finalUrl = await handleRender();
      
      if (finalUrl) {
        onAddToProject(
          item,
          customizations,
          finalUrl,
          selectedVariantId || undefined,
          brasao
        );
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.titleWrapper}>
              <FiBox className={styles.titleIcon} />
              <h2 className={styles.title}>
                {item.name}
              </h2>
            </div>
            <span className={styles.subtitle}>
              Personalize cada detalhe do seu produto exclusivo
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.layersPanel}>
            {item.variants && item.variants.length > 1 && (
              <div className={styles.variantSection}>
                <label className={styles.sectionLabel}>Escolha o Modelo</label>
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

            <div className={styles.customizationSection}>
              <div className={styles.sectionHeader}>
                <label className={styles.sectionLabel}>Personalizar Camadas</label>
                <span className={styles.layersCount}>{visualLayers.length} partes</span>
              </div>
              
              {loadingPatterns ? (
                <div className={styles.loadingPatterns}>Carregando texturas...</div>
              ) : (
                <>
                  <LayerCustomizer
                    layers={visualLayers}
                    patterns={adaptedPatterns}
                    customizations={customizations}
                    onCustomizationsChange={setCustomizations}
                  />
                  
                  <div style={{ marginTop: '24px' }}>
                    <BrasaoControl 
                      value={brasao}
                      onChange={setBrasao}
                      itemId={item.id}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.previewPanel}>
            <ProjectRenderer
              previewUrl={previewUrl}
              isRendering={isRendering}
              onRender={handleRender}
              renderTime={renderTime}
              brasao={brasao}
              onBrasaoChange={setBrasao}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerInfo}>
             {(customizations.length > 0 || brasao) && (
               <span className={styles.changesSummary}>
                 <FiCheckCircle size={16} /> 
                 {customizations.length + (brasao ? 1 : 0)} personalizações aplicadas
               </span>
             )}
          </div>
          <div className={styles.footerActions}>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirm}
              disabled={!previewUrl || isRendering || isSaving}
            >
              {isSaving ? 'Processando...' : (initialCustomizations ? 'Salvar Alterações' : 'Adicionar ao Projeto')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}