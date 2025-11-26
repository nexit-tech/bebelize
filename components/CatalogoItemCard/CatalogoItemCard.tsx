'use client';

import { FiImage, FiLayers } from 'react-icons/fi';
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

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label={`Ver item ${item.name}`}
    >
      <div className={styles.cardHeader}>
        <span className={`${styles.badge} ${isComposite ? styles.badgeComposite : styles.badgeSimple}`}>
          {isComposite ? 'Personalizável' : 'Simples'}
        </span>
      </div>

      <div className={styles.iconContainer}>
        {isComposite ? (
          <FiLayers size={32} />
        ) : (
          <FiImage size={32} />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
        {isComposite && (
          <span className={styles.layerInfo}>
            {layerCount} {layerCount === 1 ? 'camada' : 'camadas'}
          </span>
        )}
      </div>
    </button>
  );
}