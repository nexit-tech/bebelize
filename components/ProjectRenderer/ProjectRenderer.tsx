import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiImage, FiRefreshCw, FiAlertCircle, FiLoader } from 'react-icons/fi';
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const calculateViewport = useCallback(() => {
    if (imgRef.current && containerRef.current) {
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setViewport({
        width: rect.width,
        height: rect.height,
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', calculateViewport);
    return () => window.removeEventListener('resize', calculateViewport);
  }, [calculateViewport]);

  useEffect(() => {
    if (isImageLoaded && !isRendering) {
      calculateViewport();
    }
  }, [isImageLoaded, calculateViewport, previewUrl, isRendering]);

  const handleImageLoad = () => {
    setImageError(false);
    setIsImageLoaded(true);
    calculateViewport();
  };

  const toBackendCoords = (viewX: number, viewY: number, viewW: number, viewH: number) => {
    const ratio = BASE_SIZE / viewport.width;
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
              <>
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Produto"
                  className={styles.previewImage}
                  onLoad={handleImageLoad}
                  onError={() => setImageError(true)}
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
                      overflow: 'hidden'
                    }}
                  >
                    <Rnd
                      size={{ width: viewCoords.width, height: viewCoords.height }}
                      position={{ x: viewCoords.x, y: viewCoords.y }}
                      onDragStop={handleDragStop}
                      onResizeStop={handleResizeStop}
                      bounds="parent"
                      lockAspectRatio={true}
                      minWidth={20}
                      minHeight={20}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                      className={styles.rndItem}
                    >
                      <div className={styles.brasaoContent}>
                        <img 
                          src={brasao.url} 
                          alt="Brasão" 
                          draggable={false} 
                          className={styles.brasaoImage}
                        />
                        <div className={styles.selectionBorder} />
                        <div className={styles.resizeHandle} />
                      </div>
                    </Rnd>
                  </div>
                )}
              </>
            )}
          </>
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