import React from 'react';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import type { DiscoveredCollection } from '@/lib/discovery/types';
import styles from './BrowseCollectionCardDiscovery.module.css';

interface BrowseCollectionCardDiscoveryProps {
  collection: DiscoveredCollection;
  onClick: () => void;
}

export default function BrowseCollectionCardDiscovery({
  collection,
  onClick
}: BrowseCollectionCardDiscoveryProps) {
  return (
    <button
      className={styles.card}
      onClick={onClick}
      aria-label={`Ver itens da ${collection.name}`}
    >
      <div className={styles.iconContainer}>
        <FiPackage size={24} />
      </div>
      <div className={styles.collectionInfo}>
        <h4 className={styles.collectionName}>{collection.name}</h4>
        <p className={styles.collectionDescription}>{collection.description}</p>
        <span className={styles.itemCount}>
          {collection.item_count} {collection.item_count === 1 ? 'item' : 'itens'}
        </span>
      </div>
      <FiChevronRight size={20} className={styles.arrow} />
    </button>
  );
}