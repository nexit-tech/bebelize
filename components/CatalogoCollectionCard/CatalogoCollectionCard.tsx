'use client';

import { FiPackage, FiChevronRight } from 'react-icons/fi';
import type { DiscoveredCollection } from '@/lib/discovery/types';
import styles from './CatalogoCollectionCard.module.css';

interface CatalogoCollectionCardProps {
  collection: DiscoveredCollection;
  onClick: () => void;
}

export default function CatalogoCollectionCard({
  collection,
  onClick
}: CatalogoCollectionCardProps) {
  const itemCount = collection.item_count ?? 0;
  const itemLabel = itemCount === 1 ? 'item' : 'itens';

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label={`Ver coleção ${collection.name}`}
    >
      <div className={styles.iconContainer}>
        <FiPackage size={24} />
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{collection.name}</h3>
        {collection.description && (
          <p className={styles.description}>{collection.description}</p>
        )}
        <span className={styles.itemCount}>
          {itemCount} {itemLabel}
        </span>
      </div>

      <div className={styles.arrow}>
        <FiChevronRight size={20} />
      </div>
    </button>
  );
}