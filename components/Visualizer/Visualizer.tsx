import React from 'react';
import { FiImage } from 'react-icons/fi';
import styles from './Visualizer.module.css';

interface VisualizerProps {
  projectName: string;
  selectedCollection: string;
  primaryColor: string;
  secondaryColor: string;
  embroideryName: string;
}

export default function Visualizer({
  projectName,
  selectedCollection,
  primaryColor,
  secondaryColor,
  embroideryName
}: VisualizerProps) {

  // Mapeamento de cores para visualização
  const colorMap: { [key: string]: string } = {
    bege: '#D4C5B9',
    rosa: '#E8C4C4',
    azul: '#B0C4DE',
    verde: '#C8D5B9',
    branco: '#F8F8F8'
  };

  return (
    <div className={styles.visualizerContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Visualização do Projeto</h2>
        <p className={styles.subtitle}>Prévia em tempo real das personalizações</p>
      </div>

      {/* Canvas de Visualização */}
      <div className={styles.canvas}>
        
        {!selectedCollection ? (
          // Estado Vazio
          <div className={styles.emptyState}>
            <FiImage size={64} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Selecione uma coleção</p>
            <p className={styles.emptySubtext}>A prévia do produto aparecerá aqui</p>
          </div>
        ) : (
          // Mockup do Produto
          <div className={styles.mockup}>
            <div 
              className={styles.productPreview}
              style={{
                background: `linear-gradient(135deg, ${colorMap[primaryColor] || '#F2F2F2'} 0%, ${colorMap[secondaryColor] || '#FFFFFF'} 100%)`
              }}
            >
              {embroideryName && (
                <div className={styles.embroideryPreview}>
                  <span className={styles.embroideryText}>{embroideryName}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Informações de Personalização */}
      {selectedCollection && (
        <div className={styles.infoPanel}>
          <h3 className={styles.infoPanelTitle}>Personalizações Aplicadas</h3>
          <div className={styles.infoList}>
            {primaryColor && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cor Principal:</span>
                <div className={styles.infoValue}>
                  <div 
                    className={styles.colorPreview} 
                    style={{ backgroundColor: colorMap[primaryColor] }}
                  />
                  <span>{primaryColor.charAt(0).toUpperCase() + primaryColor.slice(1)}</span>
                </div>
              </div>
            )}
            {secondaryColor && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cor Secundária:</span>
                <div className={styles.infoValue}>
                  <div 
                    className={styles.colorPreview} 
                    style={{ backgroundColor: colorMap[secondaryColor] }}
                  />
                  <span>{secondaryColor.charAt(0).toUpperCase() + secondaryColor.slice(1)}</span>
                </div>
              </div>
            )}
            {embroideryName && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Bordado:</span>
                <span className={styles.infoValue}>{embroideryName}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}