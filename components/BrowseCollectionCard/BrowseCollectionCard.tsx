import React from 'react';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { Collection } from '@/types';
import styles from './BrowseCollectionCard.module.css';

interface BrowseCollectionCardProps {
  collection: Collection;
  onClick: () => void;
}

export default function BrowseCollectionCard({
  collection,
  onClick
}: BrowseCollectionCardProps) {
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
        <span className={styles.itemCount}>{collection.itemCount} itens disponíveis</span>
      </div>
      <FiChevronRight size={20} className={styles.arrow} />
    </button>
  );
}