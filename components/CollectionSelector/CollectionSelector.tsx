import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import styles from './CollectionSelector.module.css';

interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

interface CollectionSelectorProps {
  collections: Collection[];
  selectedCollection: string;
  onSelect: (collectionId: string) => void;
}

export default function CollectionSelector({ collections, selectedCollection, onSelect }: CollectionSelectorProps) {
  return (
    <div className={styles.collectionContainer}>
      <label className={styles.label}>Selecione uma Coleção</label>
      <div className={styles.collectionList}>
        {collections.map((collection) => (
          <button
            key={collection.id}
            className={`${styles.collectionCard} ${selectedCollection === collection.id ? styles.selected : ''}`}
            onClick={() => onSelect(collection.id)}
            aria-label={`Selecionar coleção ${collection.name}`}
          >
            <div className={styles.collectionInfo}>
              <h4 className={styles.collectionName}>{collection.name}</h4>
              <p className={styles.collectionDescription}>{collection.description}</p>
              <span className={styles.itemCount}>{collection.itemCount} itens disponíveis</span>
            </div>
            <FiChevronRight size={20} className={styles.arrow} />
          </button>
        ))}
      </div>
    </div>
  );
}