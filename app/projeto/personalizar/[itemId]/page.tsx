'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatterns } from '@/hooks/usePatterns';
import { renderingService } from '@/lib/supabase/rendering.service';
import LayerCustomizer from '@/components/LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '@/components/ProjectRenderer/ProjectRenderer';
import { Layer, LayerCustomization, RenderRequest, RenderResponse } from '@/types/rendering.types';
import styles from './page.module.css';

interface ItemData {
  id: string;
  name: string;
  collection_id: string;
  layers_metadata?: {
    layers: Layer[];
  };
}

export default function PersonalizarItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;

  const { patterns, isLoading: patternsLoading } = usePatterns();
  
  const [item, setItem] = useState<ItemData | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setIsLoading(true);
      const itemData = await renderingService.getItemMetadata(itemId);
      
      if (!itemData) {
        alert('Item não encontrado');
        router.push('/catalogo');
        return;
      }

      setItem(itemData);

      if (itemData.layers_metadata?.layers) {
        setLayers(itemData.layers_metadata.layers);
      }
    } catch (error) {
      console.error('Error loading item:', error);
      alert('Erro ao carregar item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRender = async () => {
    if (customizations.length === 0) {
      alert('Selecione ao menos uma textura para renderizar');
      return;
    }

    if (!item) return;

    try {
      setIsRendering(true);
      
      const request: RenderRequest = {
        item_id: itemId,
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

  if (isLoading || patternsLoading) {
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
            layers={layers}
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