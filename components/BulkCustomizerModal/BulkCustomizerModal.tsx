'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import type { DiscoveredItem, DiscoveredLayer } from '@/lib/discovery/types';
import type { LayerCustomization, RenderResponse } from '@/types/rendering.types';
import { useDiscoveredPatterns } from '@/hooks/useDiscoveredPatterns';
import Button from '../Button/Button';
import LayerCustomizer from '../LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '../ProjectRenderer/ProjectRenderer';
import styles from './BulkCustomizerModal.module.css';

interface BulkCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DiscoveredItem[];
  onConfirm: (customizedItems: { item: DiscoveredItem, customizations: LayerCustomization[], renderUrl: string }[]) => void;
}

export default function BulkCustomizerModal({
  isOpen,
  onClose,
  items,
  onConfirm
}: BulkCustomizerModalProps) {
  const { patterns, isLoading: loadingPatterns } = useDiscoveredPatterns();
  
  const [globalCustomizations, setGlobalCustomizations] = useState<LayerCustomization[]>([]);
  const [renderResults, setRenderResults] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Ref para controlar o debounce e evitar loops
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGlobalCustomizations([]);
      setRenderResults({});
      setLoadingStates({});
      
      const initialResults: Record<string, string> = {};
      items.forEach(item => {
        initialResults[item.id] = item.image_url || '';
      });
      setRenderResults(initialResults);
    }
  }, [isOpen, items]);

  // Efeito Centralizado de Renderização em Massa (Com Debounce)
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    // Limpa timer anterior para evitar chamadas excessivas
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Só dispara se houver customizações reais
    if (globalCustomizations.length > 0) {
      timeoutRef.current = setTimeout(async () => {
        
        // Define loading para todos os itens afetados
        const newLoadingStates: Record<string, boolean> = {};
        items.forEach(item => { newLoadingStates[item.id] = true; });
        setLoadingStates(newLoadingStates);

        // Processa cada item
        for (const item of items) {
          // Filtra apenas as camadas que este item possui
          const itemSpecificCustomizations = globalCustomizations.filter(c => 
            item.layers?.some(l => l.index === c.layer_index)
          );

          if (itemSpecificCustomizations.length === 0) {
             setLoadingStates(prev => ({ ...prev, [item.id]: false }));
             continue;
          }

          try {
            const res = await fetch('/api/render', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                item_id: item.id,
                collection_id: item.collection_id,
                customizations: itemSpecificCustomizations,
                layers: item.layers
              })
            });
            
            const data: RenderResponse = await res.json();
            
            if (data.success) {
              setRenderResults(prev => ({ ...prev, [item.id]: data.preview_url }));
            }
          } catch (error) {
            console.error(`Erro ao renderizar item ${item.id}:`, error);
          } finally {
            setLoadingStates(prev => ({ ...prev, [item.id]: false }));
          }
        }
      }, 800); // 800ms de espera após a última alteração
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [globalCustomizations, isOpen, items]);

  const masterLayers = useMemo(() => {
    let maxLayers = 0;
    items.forEach(item => {
      const layerCount = item.layers?.filter(l => l.type !== 'fixed').length || 0;
      if (layerCount > maxLayers) maxLayers = layerCount;
    });

    return Array.from({ length: maxLayers }).map((_, idx) => ({
      id: `master-layer-${idx}`,
      index: idx,
      name: `Camada ${idx + 1}`,
      type: 'pattern',
      zIndex: idx,
      file: '',
      url: ''
    } as unknown as DiscoveredLayer));
  }, [items]);

  const handleGlobalCustomizationChange = (newCustomizations: LayerCustomization[]) => {
    setGlobalCustomizations(newCustomizations);
  };

  const handleConfirm = () => {
    const results = items.map(item => ({
      item,
      customizations: globalCustomizations.filter(c => 
        item.layers?.some(l => l.index === c.layer_index)
      ),
      renderUrl: renderResults[item.id] || item.image_url || ''
    }));

    onConfirm(results);
    onClose();
  };

  const isAnyLoading = Object.values(loadingStates).some(state => state);

  if (!isOpen || items.length === 0) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>Personalização em Conjunto</h2>
            <span className={styles.subtitle}>
              Editando {items.length} itens simultaneamente. As alterações são aplicadas automaticamente.
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.controlsPanel}>
            <h3 className={styles.panelTitle}>Configuração Global</h3>
            
            {loadingPatterns ? (
              <p style={{ fontSize: '13px', color: '#999' }}>Carregando catálogo...</p>
            ) : (
              <LayerCustomizer
                layers={masterLayers}
                patterns={patterns}
                customizations={globalCustomizations}
                onCustomizationsChange={handleGlobalCustomizationChange}
              />
            )}
          </div>

          <div className={styles.previewsContainer}>
            {items.map((item) => {
              return (
                <div key={item.id} className={styles.itemPreviewCard}>
                  <div className={styles.rendererWrapper}>
                    <ProjectRenderer
                      previewUrl={renderResults[item.id] || item.image_url || null}
                      isRendering={loadingStates[item.id] || false}
                      onRender={() => {}} // Função vazia para evitar loop reverso
                      renderTime={undefined}
                    />
                  </div>
                  <span className={styles.itemName}>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={isAnyLoading}
          >
            <FiCheck size={18} />
            Confirmar Todos ({items.length})
          </Button>
        </div>
      </div>
    </div>
  );
}