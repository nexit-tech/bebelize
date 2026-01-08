import { useState } from 'react';
import { FiImage, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
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
        <div className={styles.headerTitleGroup}>
          <FiImage size={18} />
          <h3 className={styles.title}>Visualização</h3>
        </div>
        {renderTime && (
          <span className={styles.renderTimeBadge}>
            {renderTime}ms
          </span>
        )}
      </div>

      <div className={styles.previewStage}>
        {/* Padrão de grid removido conforme solicitado */}
        
        <div className={styles.contentWrapper}>
          {!previewUrl && !isRendering && (
            <div className={styles.emptyState}>
              <div className={styles.iconCircle}>
                <FiImage size={32} />
              </div>
              <p className={styles.emptyText}>
                Configure as opções ao lado para visualizar o resultado.
              </p>
            </div>
          )}

          {isRendering && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Gerando imagem...</p>
            </div>
          )}

          {previewUrl && !isRendering && !imageError && (
            <div className={styles.imageContainer}>
              <img
                src={previewUrl}
                alt="Preview do produto personalizado"
                className={styles.previewImage}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {imageError && (
            <div className={styles.errorState}>
              <FiAlertCircle size={32} />
              <p>Erro ao carregar imagem</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.renderButton}
          onClick={onRender}
          disabled={isRendering}
        >
          {isRendering ? (
            <>
              <div className={styles.miniSpinner} /> Processando...
            </>
          ) : (
            <>
              <FiRefreshCw size={18} /> Atualizar Visualização
            </>
          )}
        </button>
      </div>
    </div>
  );
}