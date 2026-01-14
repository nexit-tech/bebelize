import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
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

export default function ProjectRenderer({
  previewUrl,
  isRendering,
  onRender,
  renderTime,
  brasao,
  onBrasaoChange
}: ProjectRendererProps) {
  const [imageError, setImageError] = useState(false);
  const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [shouldCenterBrasao, setShouldCenterBrasao] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (previewUrl) {
      setShouldCenterBrasao(true);
    }
  }, [previewUrl]);

  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setDisplayedSize({
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const currentDisplayWidth = img.offsetWidth;
    const currentDisplayHeight = img.offsetHeight;
    const currentNaturalWidth = img.naturalWidth;
    const currentNaturalHeight = img.naturalHeight;

    setDisplayedSize({ width: currentDisplayWidth, height: currentDisplayHeight });
    setNaturalSize({ width: currentNaturalWidth, height: currentNaturalHeight });
    setImageError(false);

    if (brasao && onBrasaoChange && shouldCenterBrasao && currentNaturalWidth > 0) {
      const defaultWidth = currentNaturalWidth * 0.25; 
      const defaultHeight = defaultWidth;

      const targetWidth = brasao.width || defaultWidth;
      const targetHeight = brasao.height || defaultHeight;

      const centerX = (currentNaturalWidth - targetWidth) / 2;
      const centerY = (currentNaturalHeight - targetHeight) / 2;

      onBrasaoChange({
        ...brasao,
        width: targetWidth,
        height: targetHeight,
        x: centerX,
        y: centerY
      });

      setShouldCenterBrasao(false);
    }
  };

  const ratio = naturalSize.width > 0 && displayedSize.width > 0 
    ? naturalSize.width / displayedSize.width 
    : 1;

  const handleDragStop = (d: any) => {
    if (!brasao || !onBrasaoChange) return;
    onBrasaoChange({
      ...brasao,
      x: Math.round(d.x * ratio),
      y: Math.round(d.y * ratio)
    });
  };

  const handleResizeStop = (ref: HTMLElement, position: { x: number; y: number }) => {
    if (!brasao || !onBrasaoChange) return;
    onBrasaoChange({
      ...brasao,
      width: Math.round(parseFloat(ref.style.width) * ratio),
      height: Math.round(parseFloat(ref.style.height) * ratio),
      x: Math.round(position.x * ratio),
      y: Math.round(position.y * ratio)
    });
  };

  const visualX = brasao ? brasao.x / ratio : 0;
  const visualY = brasao ? brasao.y / ratio : 0;
  const visualWidth = brasao ? brasao.width / ratio : 100;
  const visualHeight = brasao ? brasao.height / ratio : 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <FiImage size={18} />
          <h3 className={styles.title}>Visualização</h3>
        </div>
        {renderTime && (
          <span className={styles.renderTimeBadge}>{renderTime}ms</span>
        )}
      </div>

      <div className={styles.previewStage}>
        {!previewUrl && !isRendering && (
          <div className={styles.stateContainer}>
            <div className={styles.iconCircle}><FiImage size={32} /></div>
            <p>Configure as opções ao lado para visualizar.</p>
          </div>
        )}

        {isRendering && (
          <div className={styles.stateContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Gerando prévia...</p>
          </div>
        )}

        {imageError && (
          <div className={styles.stateContainer}>
            <FiAlertCircle size={32} color="var(--color-danger)" />
            <p className={styles.errorText}>Erro ao carregar imagem</p>
          </div>
        )}

        {previewUrl && !isRendering && !imageError && (
          <div className={styles.contentWrapper}>
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Produto"
              className={styles.previewImage}
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
            />

            {brasao?.url && onBrasaoChange && displayedSize.width > 0 && (
              <Rnd
                size={{ width: visualWidth, height: visualHeight }}
                position={{ x: visualX, y: visualY }}
                onDragStop={(e, d) => handleDragStop(d)}
                onResizeStop={(e, dir, ref, delta, pos) => handleResizeStop(ref, pos)}
                bounds="parent"
                lockAspectRatio={true}
                minWidth={30}
                minHeight={30}
                className={styles.rndWrapper}
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
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.renderButton} onClick={onRender} disabled={isRendering}>
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