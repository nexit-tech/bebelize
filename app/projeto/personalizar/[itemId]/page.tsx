'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatterns } from '@/hooks/usePatterns';
import { useItemsDiscovery } from '@/hooks/useItemsDiscovery';
import { renderingService } from '@/lib/supabase/rendering.service';
import LayerCustomizer from '@/components/LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '@/components/ProjectRenderer/ProjectRenderer';
import { LayerCustomization, RenderRequest, RenderResponse } from '@/types/rendering.types';
import type { DiscoveredItem } from '@/lib/discovery/types';
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

  useEffect(() => {
    if (!itemsLoading) {
      const foundItem = getItemById(itemId);
      
      if (!foundItem) {
        alert('Item não encontrado');
        router.push('/catalogo');
        return;
      }

      setItem(foundItem);
    }
  }, [itemId, itemsLoading, getItemById, router]);

  const handleRender = async () => {
    if (customizations.length === 0) {
      alert('Selecione ao menos uma textura para renderizar');
      return;
    }

    if (!item) return;

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
          <h2 className={styles.sectionTitle}>Configurar Camadas</h2>
          <LayerCustomizer
            layers={item.layers}
            patterns={patterns}
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