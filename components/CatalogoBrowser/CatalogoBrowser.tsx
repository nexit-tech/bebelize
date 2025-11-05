import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Collection, Item } from '@/types';
import { collectionsData, itemsData } from '@/data';
import BrowseCollectionCard from '../BrowseCollectionCard/BrowseCollectionCard';
import BrowseItemCard from '../BrowseItemCard/BrowseItemCard';
import styles from './CatalogoBrowser.module.css';

interface CatalogoBrowserProps {
  onCustomizeItem: (item: Item) => void;
}

type View = 'collections' | 'items';

export default function CatalogoBrowser({ onCustomizeItem }: CatalogoBrowserProps) {
  const [view, setView] = useState<View>('collections');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setView('items');
  };

  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setView('collections');
  };

  const getItemsByCollection = () => {
    if (!selectedCollection) return [];
    return itemsData.filter(item => item.collectionId === selectedCollection.id);
  };

  const renderHeader = () => {
    if (view === 'collections') {
      return <h2 className={styles.title}>Selecione uma Coleção</h2>;
    }
    return (
      <>
        <button 
          className={styles.backButton} 
          onClick={handleBackToCollections}
          aria-label="Voltar para coleções"
        >
          <FiArrowLeft size={20} />
        </button>
        <h2 className={styles.title}>{selectedCollection?.name}</h2>
      </>
    );
  };

  const renderContent = () => {
    if (view === 'collections') {
      return (
        <div className={styles.grid}>
          {collectionsData.map(collection => (
            <BrowseCollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => handleCollectionClick(collection)}
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className={`${styles.grid} ${styles.items}`}>
        {getItemsByCollection().map(item => (
          <BrowseItemCard
            key={item.id}
            item={item}
            onCustomizeItem={onCustomizeItem}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {renderHeader()}
      </header>
      {renderContent()}
    </div>
  );
}