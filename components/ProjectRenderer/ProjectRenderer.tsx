'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiImage, FiRefreshCw, FiAlertCircle, FiRotateCw, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { Rnd } from 'react-rnd';
import styles from './ProjectRenderer.module.css';
import type { BrasaoCustomization } from '@/types/rendering.types';

interface ProjectRendererProps {
  previewUrl: string | null;
  isRendering: boolean;
  onRender: () => void;
  renderTime?: number;
  brasao?: BrasaoCustomization;
  onBrasaoChange?: (val: BrasaoCustomization) => void;
}

const BASE_SIZE = 1000;

export default function ProjectRenderer({
  previewUrl,
  isRendering,
  onRender,
  renderTime,
  brasao,
  onBrasaoChange
}: ProjectRendererProps) {
  const [imageError, setImageError] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const elementRef = useRef<any>(null);

  useEffect(() => {
    setIsImageLoaded(false);
    setImageError(false);
    setZoomLevel(1); 
  }, [previewUrl]);

  // CORREÇÃO: Calculamos o viewport SEMPRE considerando a escala 1 (sem zoom).
  // O CSS transform cuidará do zoom visual, mantendo as coordenadas relativas perfeitas.
  const calculateViewport = useCallback(() => {
    if (imgRef.current && containerRef.current) {
      const img = imgRef.current;
      
      // Resetamos temporariamente o transform para medir o tamanho real original
      const currentTransform = img.style.transform;
      img.style.transform = 'none';
      
      const rect = img.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Restauramos (embora o render vá cuidar disso, garante consistência no cálculo)
      img.style.transform = currentTransform;

      // Importante: Não dividimos pelo zoomLevel aqui. 
      // Queremos as dimensões "reais" dentro do container, o scale do pai fará o resto.
      setViewport({
        width: img.offsetWidth, // Usa offsetWidth para pegar tamanho renderizado "nativo" do CSS layout
        height: img.offsetHeight,
        left: (containerRect.width - img.offsetWidth) / 2, // Centraliza matematicamente
        top: (containerRect.height - img.offsetHeight) / 2
      });
    }
  }, []); // Dependências vazias ou apenas window resize

  useEffect(() => {
    window.addEventListener('resize', calculateViewport);
    return () => window.removeEventListener('resize', calculateViewport);
  }, [calculateViewport]);

  useEffect(() => {
    if (isImageLoaded && !isRendering) {
      // Pequeno delay para garantir que o layout estabilizou
      const timer = setTimeout(() => calculateViewport(), 50);
      return () => clearTimeout(timer);
    }
  }, [isImageLoaded, calculateViewport, isRendering]);

  // Lógica de Zoom
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  // Lógica de Rotação
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isRotating || !brasao || !onBrasaoChange || !elementRef.current) return;

      const el = elementRef.current.getSelfElement();
      if (!el) return;
      
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const radians = Math.atan2(e.clientX - centerX, -(e.clientY - centerY));
      const degrees = radians * (180 / Math.PI);

      onBrasaoChange({
        ...brasao,
        rotation: Math.round(degrees)
      });
    };

    const handleMouseUp = () => {
      setIsRotating(false);
      document.body.style.cursor = 'default';
    };

    if (isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isRotating, brasao, onBrasaoChange]);

  const handleImageLoad = () => {
    setImageError(false);
    setIsImageLoaded(true);
    calculateViewport();
  };

  const toBackendCoords = (viewX: number, viewY: number, viewW: number, viewH: number) => {
    const ratio = BASE_SIZE / (viewport.width || 1);
    return {
      x: Math.round(viewX * ratio),
      y: Math.round(viewY * ratio),
      width: Math.round(viewW * ratio),
      height: Math.round(viewH * ratio)
    };
  };

  const toViewCoords = () => {
    if (!brasao || viewport.width === 0) return { x: 0, y: 0, width: 0, height: 0 };
    const ratio = viewport.width / BASE_SIZE;
    return {
      x: brasao.x * ratio,
      y: brasao.y * ratio,
      width: brasao.width * ratio,
      height: brasao.height * ratio
    };
  };

  const viewCoords = toViewCoords();

  const handleDragStop = (e: any, d: { x: number; y: number }) => {
    if (!brasao || !onBrasaoChange) return;
    const newCoords = toBackendCoords(d.x, d.y, viewCoords.width, viewCoords.height);
    onBrasaoChange({ ...brasao, x: newCoords.x, y: newCoords.y });
  };

  const handleResizeStop = (e: any, dir: any, ref: HTMLElement, delta: any, position: { x: number; y: number }) => {
    if (!brasao || !onBrasaoChange) return;
    const newCoords = toBackendCoords(
      position.x,
      position.y,
      parseFloat(ref.style.width),
      parseFloat(ref.style.height)
    );
    onBrasaoChange({ ...brasao, ...newCoords });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <FiImage size={18} />
          <h3 className={styles.title}>Visualização</h3>
        </div>
        {!isRendering && renderTime && (
          <span className={styles.renderTimeBadge}>{renderTime}ms</span>
        )}
      </div>

      <div className={styles.previewStageWrapper}>
        <div className={styles.previewStage} ref={containerRef}>
          
          {isRendering ? (
            <div className={styles.stateContainer}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Processando imagem...</p>
            </div>
          ) : (
            <>
              {!previewUrl && (
                <div className={styles.stateContainer}>
                  <div className={styles.iconCircle}><FiImage size={32} /></div>
                  <p>Configure as opções ao lado para visualizar.</p>
                </div>
              )}

              {imageError && previewUrl && (
                <div className={styles.stateContainer}>
                  <FiAlertCircle size={32} color="var(--color-danger)" />
                  <p className={styles.errorText}>Erro ao carregar imagem</p>
                </div>
              )}

              {previewUrl && !imageError && (
                <div 
                  className={styles.zoomableContent}
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    alt="Produto"
                    className={styles.previewImage}
                    onLoad={handleImageLoad}
                    onError={() => setImageError(true)}
                    style={{ opacity: isImageLoaded ? 1 : 0 }}
                  />

                  {isImageLoaded && brasao?.url && onBrasaoChange && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: viewport.left,
                        top: viewport.top,
                        width: viewport.width,
                        height: viewport.height,
                        pointerEvents: 'none',
                        // O zIndex aqui garante que o brasão fique sobre a imagem, 
                        // mas dentro do container zoomable
                        zIndex: 10 
                      }}
                    >
                      <Rnd
                        ref={elementRef}
                        scale={zoomLevel} // Mantemos o scale aqui apenas para correção do mouse drag delta
                        size={{ width: viewCoords.width, height: viewCoords.height }}
                        position={{ x: viewCoords.x, y: viewCoords.y }}
                        onDragStop={handleDragStop}
                        onResizeStop={handleResizeStop}
                        bounds="parent"
                        lockAspectRatio={true}
                        minWidth={40}
                        minHeight={40}
                        className={styles.rndItem}
                        style={{ pointerEvents: 'auto' }}
                        dragHandleClassName={styles.brasaoContent}
                      >
                        <div 
                          className={styles.brasaoContent}
                          style={{ transform: `rotate(${brasao.rotation || 0}deg)` }}
                        >
                          <img 
                            src={brasao.url} 
                            alt="Brasão" 
                            draggable={false} 
                            className={styles.brasaoImage}
                          />
                          <div className={styles.selectionBorder} />
                          
                          <div 
                            className={styles.rotationHandle} 
                            onMouseDown={handleRotateStart}
                            title="Girar"
                          >
                            <FiRotateCw size={14} />
                          </div>
                        </div>
                      </Rnd>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Controles de Zoom Flutuantes */}
        {previewUrl && !isRendering && (
          <div className={styles.zoomControls}>
            <button onClick={handleZoomOut} className={styles.zoomButton} title="Reduzir Zoom">
              <FiZoomOut size={16} />
            </button>
            <span className={styles.zoomIndicator}>{Math.round(zoomLevel * 100)}%</span>
            <button onClick={handleZoomIn} className={styles.zoomButton} title="Aumentar Zoom">
              <FiZoomIn size={16} />
            </button>
            <div className={styles.zoomDivider} />
            <button onClick={handleResetZoom} className={styles.zoomButton} title="Resetar">
              <FiMaximize size={16} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button 
          className={styles.renderButton} 
          onClick={onRender} 
          disabled={isRendering || !previewUrl}
        >
          {isRendering ? (
            'Processando...'
          ) : (
            <><FiRefreshCw size={18} /> Atualizar Visualização</>
          )}
        </button>
      </div>
    </div>
  );
}