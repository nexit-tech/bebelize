'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiX, FiChevronDown, FiBox, FiCheckCircle, FiUpload, FiTrash2, FiMove, FiMaximize, FiLoader } from 'react-icons/fi';
import { Rnd } from 'react-rnd';
import { supabase } from '@/lib/supabase/client';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization, RenderResponse } from '@/types/rendering.types';
import { useDiscoveredPatterns } from '@/hooks/useDiscoveredPatterns';
import Button from '../Button/Button';
import LayerCustomizer from '../LayerCustomizer/LayerCustomizer';
import ProjectRenderer from '../ProjectRenderer/ProjectRenderer';
import styles from './ItemCustomizerModal.module.css';

interface OverlayState {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

interface ItemCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DiscoveredItem | null;
  initialCustomizations?: LayerCustomization[];
  initialPreviewUrl?: string | null;
  initialVariantId?: string | null;
  initialOverlay?: OverlayState | null;
  onAddToProject: (
    item: DiscoveredItem, 
    customizations: LayerCustomization[], 
    renderUrl: string, 
    variantId?: string,
    overlay?: OverlayState | null
  ) => void;
}

export default function ItemCustomizerModal({
  isOpen,
  onClose,
  item,
  initialCustomizations,
  initialPreviewUrl,
  initialVariantId,
  initialOverlay,
  onAddToProject
}: ItemCustomizerModalProps) {
  const { patterns, isLoading: loadingPatterns } = useDiscoveredPatterns();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [customizations, setCustomizations] = useState<LayerCustomization[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [renderTime, setRenderTime] = useState<number | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      if (initialCustomizations) {
        setCustomizations(initialCustomizations);
        setPreviewUrl(initialPreviewUrl || item.image_url || null);
        setSelectedVariantId(initialVariantId || (item.variants?.[0]?.id || null));
        setOverlay(initialOverlay || null);
      } else {
        setCustomizations([]);
        const firstVariantId = item.variants?.[0]?.id || null;
        setSelectedVariantId(firstVariantId);
        
        const variant = item.variants?.find(v => v.id === firstVariantId);
        setPreviewUrl(variant?.previewUrl || item.image_url || null);
        setOverlay(null);
      }
      setRenderTime(undefined);
    }
  }, [isOpen, item, initialCustomizations, initialPreviewUrl, initialVariantId, initialOverlay]);

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
        variant_id: selectedVariantId,
        collection_id: item.collection_id,
        customizations,
        layers: allLayersForRender
      };

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOverlay({
            url: event.target.result as string,
            x: 50,
            y: 50,
            width: 150,
            height: 150
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadOverlayImage = async (base64Url: string): Promise<string> => {
    try {
      const res = await fetch(base64Url);
      const blob = await res.blob();
      const fileExt = blob.type.split('/')[1] || 'png';
      const fileName = `overlay-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/overlays/${fileName}`;

      const { data, error } = await supabase.storage
        .from('bebelize-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bebelize-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      throw new Error('Falha ao salvar a imagem do overlay. Verifique se o bucket "bebelize-images" existe e é público.');
    }
  };

  const handleSaveProcess = async () => {
    if (!previewUrl) return;

    try {
      setIsUploading(true);
      
      let finalOverlay = overlay;

      if (overlay && overlay.url.startsWith('data:')) {
        const publicUrl = await uploadOverlayImage(overlay.url);
        finalOverlay = { ...overlay, url: publicUrl };
      }

      onAddToProject(
        item!, 
        customizations, 
        previewUrl, 
        selectedVariantId || undefined,
        finalOverlay
      );

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveOverlay = () => {
    setOverlay(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                <LayerCustomizer
                  layers={visualLayers}
                  patterns={patterns}
                  customizations={customizations}
                  onCustomizationsChange={setCustomizations}
                />
              )}
            </div>

            <div className={styles.overlaySection}>
              <div className={styles.sectionHeader}>
                <label className={styles.sectionLabel}>Apliques / Logos</label>
              </div>
              
              {!overlay ? (
                <div 
                  className={styles.uploadBox}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload size={20} />
                  <span>Carregar Imagem</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    hidden 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className={styles.overlayControls}>
                  <div className={styles.overlayInfo}>
                    <img src={overlay.url} alt="Overlay" className={styles.overlayThumb} />
                    <span>Imagem aplicada</span>
                  </div>
                  <button 
                    className={styles.removeOverlayBtn}
                    onClick={handleRemoveOverlay}
                    title="Remover imagem"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )}
              <p className={styles.helperText}>
                Carregue uma imagem para sobrepor ao produto. Mova e redimensione livremente na visualização.
              </p>
            </div>
          </div>

          <div className={styles.previewPanel}>
            <div className={styles.canvasContainer}>
              <ProjectRenderer
                previewUrl={previewUrl}
                isRendering={isRendering}
                onRender={handleRender}
                renderTime={renderTime}
              />
              
              {overlay && (
                <Rnd
                  size={{ width: overlay.width, height: overlay.height }}
                  position={{ x: overlay.x, y: overlay.y }}
                  onDragStop={(e, d) => {
                    setOverlay(prev => prev ? ({ ...prev, x: d.x, y: d.y }) : null);
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setOverlay(prev => prev ? ({
                      ...prev,
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      ...position
                    }) : null);
                  }}
                  bounds="parent"
                  lockAspectRatio={true}
                  className={styles.rndOverlay}
                  dragHandleClassName={styles.rndHandle}
                >
                  <div className={styles.overlayContent}>
                    <img 
                      src={overlay.url} 
                      alt="Overlay" 
                      className={styles.overlayImage} 
                      draggable={false}
                    />
                    
                    <div 
                      className={styles.floatingDeleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOverlay();
                      }}
                      title="Remover"
                    >
                      <FiX size={14} />
                    </div>
                  </div>
                </Rnd>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerInfo}>
             {(customizations.length > 0 || overlay) && (
               <span className={styles.changesSummary}>
                 <FiCheckCircle size={16} /> 
                 {customizations.length + (overlay ? 1 : 0)} personalizações
               </span>
             )}
          </div>
          <div className={styles.footerActions}>
            <Button variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveProcess}
              disabled={!previewUrl || isRendering || isUploading}
            >
              {isUploading ? (
                <><FiLoader className={styles.spin} /> Salvando Imagem...</>
              ) : (
                initialCustomizations ? 'Salvar Alterações' : 'Adicionar ao Projeto'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}