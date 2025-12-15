'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiChevronDown } from 'react-icons/fi';
import { usePatterns } from '@/hooks/usePatterns';
import { useItemsDiscovery } from '@/hooks/useItemsDiscovery';
import LayerCustomizer from '@/components/LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '@/components/ProjectRenderer/ProjectRenderer';
import { LayerCustomization, RenderResponse } from '@/types/rendering.types';
import type { DiscoveredItem, DiscoveredPattern } from '@/lib/discovery/types';
import styles from './page.module.css';

export default function PersonalizarItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;
  const { patterns, isLoading: patternsLoading } = usePatterns();
  const { getItemById, isLoading: itemsLoading } = useItemsDiscovery();
  const [item, setItem] = useState<DiscoveredItem | null>(null);
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!itemsLoading) {
      const foundItem = getItemById(itemId);
      
      if (!foundItem) {
        alert('Item não encontrado');
        router.push('/catalogo');
        return;
      }

      setItem(foundItem);

      let initialVariantId: string | null = null;
      if (foundItem.variants && foundItem.variants.length > 0) {
        initialVariantId = foundItem.variants[0].id;
      }
      setSelectedVariantId(initialVariantId);

      const variant = foundItem.variants?.find(v => v.id === initialVariantId);
      const initialImage = variant?.previewUrl || foundItem.image_url || null;
      setPreviewUrl(initialImage);
    }
  }, [itemId, itemsLoading, getItemById, router]);

  const adaptedPatterns: DiscoveredPattern[] = useMemo(() => {
    return patterns.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      file: '',
      url: p.image_url,
      thumbnail_url: p.thumbnail_url || p.image_url
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
    if (!item) return;

    try {
      setIsRendering(true);
      
      const request: any = {
        item_id: item.id,
        collection_id: item.collection_id,
        customizations,
        layers: allLayersForRender
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
        alert(`Erro na renderização: ${data.error}`);
      }
    } catch (error) {
      console.error('Render error:', error);
      alert('Erro ao renderizar imagem');
    } finally {
      setIsRendering(false);
    }
  };

  if (itemsLoading || patternsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.error}>
        <p>Item não encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
        <h1 className={styles.title}>Personalizar: {item.name}</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          
          {item.variants && item.variants.length > 1 && (
            <div className={styles.variantSection}>
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

          <h2 className={styles.sectionTitle}>Configurar Camadas</h2>
          <LayerCustomizer
            layers={visualLayers}
            patterns={adaptedPatterns}
            customizations={customizations}
            onCustomizationsChange={setCustomizations}
          />
        </div>

        <div className={styles.rightPanel}>
          <ProjectRenderer
            previewUrl={previewUrl}
            isRendering={isRendering}
            onRender={handleRender}
            renderTime={renderTime}
          />
        </div>
      </div>
    </div>
  );
}