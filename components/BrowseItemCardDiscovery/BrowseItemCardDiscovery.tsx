import React from 'react';
import { FiPlus, FiLayers, FiImage } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import Button from '../Button/Button';
import styles from './BrowseItemCardDiscovery.module.css';

interface BrowseItemCardDiscoveryProps {
  item: DiscoveredItem;
  onAction: () => void;
}

export default function BrowseItemCardDiscovery({
  item,
  onAction
}: BrowseItemCardDiscoveryProps) {
  const isComposite = item.item_type === 'composite';
  const layersCount = item.layers?.length || 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.typeIndicator}>
          {isComposite ? (
            <FiLayers size={16} className={styles.typeIcon} />
          ) : (
            <FiImage size={16} className={styles.typeIcon} />
          )}
          <span className={styles.typeLabel}>
            {isComposite ? 'Personalizável' : 'Simples'}
          </span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h4 className={styles.itemName}>{item.name}</h4>
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
        {isComposite && (
          <span className={styles.layersInfo}>
            {layersCount} {layersCount === 1 ? 'camada' : 'camadas'}
          </span>
        )}
      </div>

      <div className={styles.cardFooter}>
        <Button
          variant="secondary"
          size="small"
          onClick={onAction}
          fullWidth
        >
          <FiPlus size={16} />
          <span>{isComposite ? 'Personalizar' : 'Adicionar'}</span>
        </Button>
      </div>
    </div>
  );
}