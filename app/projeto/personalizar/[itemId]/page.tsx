'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FiChevronDown, FiCheck, FiSave } from 'react-icons/fi';
import { usePatterns } from '@/hooks/usePatterns';
import { useItemsDiscovery } from '@/hooks/useItemsDiscovery';
import { useCartContext } from '@/context/CartContext';
import LayerCustomizer from '@/components/LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '@/components/ProjectRenderer/ProjectRenderer';
import BrasaoControl from '@/components/BrasaoControl/BrasaoControl';
import { LayerCustomization, RenderResponse, BrasaoCustomization } from '@/types/rendering.types';
import type { DiscoveredItem, DiscoveredPattern } from '@/lib/discovery/types';
import type { CustomizedItem } from '@/types/customizedItem.types';
import styles from './page.module.css';

export default function PersonalizarItemPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const itemId = params.itemId as string;
  const editCartId = searchParams.get('edit'); 
  const { patterns, isLoading: patternsLoading } = usePatterns();
  const { getItemById, isLoading: itemsLoading } = useItemsDiscovery();
  const { addItem, updateCartItems, cartItems } = useCartContext();
  const [item, setItem] = useState<DiscoveredItem | null>(null);
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [brasao, setBrasao] = useState<BrasaoCustomization | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (!itemsLoading) {
      const foundItem = getItemById(itemId);
      
      if (!foundItem) {
        alert('Item base não encontrado no catálogo.');
        router.push('/catalogo');
        return;
      }

      setItem(foundItem);

      if (!editCartId) {
        let initialVariantId: string | null = null;
        if (foundItem.variants && foundItem.variants.length > 0) {
          initialVariantId = foundItem.variants[0].id;
        }
        setSelectedVariantId(initialVariantId);
        const variant = foundItem.variants?.find(v => v.id === initialVariantId);
        setPreviewUrl(variant?.previewUrl || foundItem.image_url || null);
      }
    }
  }, [itemId, itemsLoading, getItemById, router, editCartId]);

  useEffect(() => {
    if (editCartId && item && cartItems.length > 0) {
      const existingItem = cartItems.find(i => i.cartItemId === editCartId);
      
      if (existingItem) {
        if (existingItem.variant_id) {
          setSelectedVariantId(existingItem.variant_id);
        }

        if (existingItem.customization_data.brasao) {
          setBrasao(existingItem.customization_data.brasao);
        }

        if (existingItem.customization_data.layers) {
          const rehydratedLayers: LayerCustomization[] = existingItem.customization_data.layers.map(l => ({
            layerId: l.layerId,
            patternId: l.patternId,
            color: l.color,
            scale: l.scale,
            opacity: l.opacity,
            blendMode: l.blendMode,
            layer_index: Number(l.layerId) 
          }));
          setCustomizations(rehydratedLayers);
        }

        if (existingItem.base_image_url) {
          setPreviewUrl(existingItem.base_image_url);
        }
      }
    }
  }, [editCartId, item, cartItems]);

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
    if (!item) return null;

    try {
      setIsRendering(true);
      
      const request: any = {
        item_id: item.id,
        collection_id: item.collection_id,
        customizations,
        layers: allLayersForRender,
        brasao
      };

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data: RenderResponse = await response.json();

      if (data.success) {
        const finalUrl = `${data.preview_url}?t=${Date.now()}`;
        setPreviewUrl(finalUrl);
        setRenderTime(data.render_time_ms);
        return finalUrl;
      } else {
        alert(`Erro na renderização: ${data.error}`);
        return null;
      }
    } catch (error) {
      console.error('Render error:', error);
      alert('Erro ao renderizar imagem');
      return null;
    } finally {
      setIsRendering(false);
    }
  };

  const handleSaveProject = async () => {
    if (!item) return;

    try {
      setIsSaving(true);

      const finalRenderUrl = await handleRender();
      if (!finalRenderUrl) return;

      const customizationData = {
        layers: customizations.map(c => ({
          layerId: c.layerId,
          patternId: c.patternId,
          color: c.color,
          scale: c.scale,
          opacity: c.opacity,
          blendMode: c.blendMode
        })),
        brasao: brasao ? {
          url: brasao.url,
          x: brasao.x,
          y: brasao.y,
          width: brasao.width,
          height: brasao.height
        } : undefined
      };

      if (editCartId) {
        const updatedList = cartItems.map(cartItem => {
          if (cartItem.cartItemId === editCartId) {
            return {
              ...cartItem,
              base_image_url: finalRenderUrl,
              variant_id: selectedVariantId,
              customization_data: customizationData,
              updated_at: new Date().toISOString()
            };
          }
          return cartItem;
        });
        
        await updateCartItems(updatedList);
      } else {
        const newItem: CustomizedItem = {
          ...item,
          cartItemId: `cart-${Date.now()}`,
          item_id: item.id,
          base_image_url: finalRenderUrl,
          quantity: 1,
          variant_id: selectedVariantId,
          customization_data: customizationData
        };
        await addItem(newItem);
      }

      router.push('/projeto/criar');

    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Não foi possível salvar o item. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (itemsLoading || patternsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando personalização...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.error}>
        <p>Item não disponível.</p>
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
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {editCartId ? 'Editar Item: ' : 'Personalizar: '} 
            {item.name}
          </h1>
          {editCartId && <span className={styles.editBadge}>Modo Edição</span>}
        </div>
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
          
          <div style={{ marginTop: '32px' }}>
            <BrasaoControl 
              value={brasao}
              onChange={setBrasao}
              itemId={item.id}
            />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <ProjectRenderer
            previewUrl={previewUrl}
            isRendering={isRendering}
            onRender={handleRender}
            renderTime={renderTime}
            brasao={brasao}
            onBrasaoChange={setBrasao}
          />

          <div className={styles.actionsFooter}>
            <button 
              className={styles.saveButton}
              onClick={handleSaveProject}
              disabled={isRendering || isSaving || !previewUrl}
            >
              {isSaving ? (
                'Processando...'
              ) : (
                <>
                  {editCartId ? <FiSave size={20} /> : <FiCheck size={20} />}
                  {editCartId ? 'Salvar Alterações' : 'Adicionar ao Projeto'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}