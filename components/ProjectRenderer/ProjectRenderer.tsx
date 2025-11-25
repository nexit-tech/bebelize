import { useState } from 'react';
import styles from './ProjectRenderer.module.css';

interface ProjectRendererProps {
  previewUrl: string | null;
  isRendering: boolean;
  onRender: () => void;
  renderTime?: number;
}

export default function ProjectRenderer({
  previewUrl,
  isRendering,
  onRender,
  renderTime
}: ProjectRendererProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Preview da Renderização</h3>
        {renderTime && (
          <span className={styles.renderTime}>
            Renderizado em {renderTime}ms
          </span>
        )}
      </div>

      <div className={styles.previewContainer}>
        {!previewUrl && !isRendering && (
          <div className={styles.placeholder}>
            <svg
              className={styles.placeholderIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className={styles.placeholderText}>
              Configure as texturas e clique em renderizar
            </p>
          </div>
        )}

        {isRendering && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Renderizando imagem...</p>
          </div>
        )}

        {previewUrl && !isRendering && !imageError && (
          <img
            src={previewUrl}
            alt="Preview da renderização"
            className={styles.previewImage}
            onError={() => setImageError(true)}
          />
        )}

        {imageError && (
          <div className={styles.error}>
            <p className={styles.errorText}>Erro ao carregar imagem</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className={styles.renderButton}
        onClick={onRender}
        disabled={isRendering}
      >
        {isRendering ? 'Renderizando...' : 'Gerar Renderização'}
      </button>
    </div>
  );
}