'use client';

import React from 'react';
import { FiLayers, FiImage } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import styles from './CatalogoItemCard.module.css';

interface CatalogoItemCardProps {
  item: DiscoveredItem;
  onClick: () => void;
}

export default function CatalogoItemCard({
  item,
  onClick
}: CatalogoItemCardProps) {
  const isComposite = item.item_type === 'composite';
  const layerCount = item.layers?.length ?? 0;

  const renderPreview = () => {
    if (item.item_type === 'simple' && item.image_url) {
      return (
        <img 
          src={item.image_url} 
          alt={item.name} 
          className={styles.previewImage}
          loading="lazy"
        />
      );
    }

    if (item.item_type === 'composite' && item.layers && item.layers.length > 0) {
      const sortedLayers = [...item.layers].sort((a, b) => a.index - b.index);
      
      return (
        <div className={styles.layersContainer}>
          {sortedLayers.map((layer) => (
            <img
              key={`${item.id}-layer-${layer.index}`}
              src={layer.url}
              alt=""
              className={styles.layerImage}
              loading="lazy"
            />
          ))}
        </div>
      );
    }

    return (
      <div className={styles.iconPlaceholder}>
        {isComposite ? (
          <FiLayers size={32} strokeWidth={1.5} />
        ) : (
          <FiImage size={32} strokeWidth={1.5} />
        )}
      </div>
    );
  };

  return (
    <div 
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.header}>
        <span className={`${styles.badge} ${isComposite ? styles.badgeComposite : styles.badgeSimple}`}>
          {isComposite ? 'Personalizável' : 'Simples'}
        </span>
      </div>

      <div className={styles.previewContainer}>
        {renderPreview()}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name} title={item.name}>
          {item.name}
        </h3>
        
        <span className={styles.details}>
          {isComposite ? `${layerCount} camadas` : 'Item único'}
        </span>
      </div>
    </div>
  );
}