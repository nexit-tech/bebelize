import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useCollections } from '@/hooks/useCollections';
import { useItems } from '@/hooks/useItems';
import type { DiscoveredCollection, DiscoveredItem } from '@/lib/discovery/types';
import BrowseCollectionCardDiscovery from '../BrowseCollectionCardDiscovery/BrowseCollectionCardDiscovery';
import BrowseItemCardDiscovery from '../BrowseItemCardDiscovery/BrowseItemCardDiscovery';
import styles from './CatalogoBrowser.module.css';

interface CatalogoBrowserProps {
  onSelectSimpleItem: (item: DiscoveredItem) => void;
  onCustomizeCompositeItem: (item: DiscoveredItem) => void;
}

type View = 'collections' | 'items';

export default function CatalogoBrowser({
  onSelectSimpleItem,
  onCustomizeCompositeItem
}: CatalogoBrowserProps) {
  const [view, setView] = useState<View>('collections');
  const [selectedCollection, setSelectedCollection] = useState<DiscoveredCollection | null>(null);

  const { collections, isLoading: collectionsLoading } = useCollections();
  const { items, isLoading: itemsLoading } = useItems(selectedCollection?.slug);

  const handleCollectionClick = (collection: DiscoveredCollection) => {
    setSelectedCollection(collection);
    setView('items');
  };

  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setView('collections');
  };

  const handleItemAction = (item: DiscoveredItem) => {
    if (item.item_type === 'simple') {
      onSelectSimpleItem(item);
    } else {
      onCustomizeCompositeItem(item);
    }
  };

  const isLoading = collectionsLoading || (view === 'items' && itemsLoading);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {view === 'collections' ? (
          <h2 className={styles.title}>Selecione uma Coleção</h2>
        ) : (
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
        )}
      </header>

      {view === 'collections' && (
        <CollectionsList
          collections={collections}
          onCollectionClick={handleCollectionClick}
        />
      )}

      {view === 'items' && (
        <ItemsList
          items={items}
          onItemAction={handleItemAction}
        />
      )}
    </div>
  );
}

interface CollectionsListProps {
  collections: DiscoveredCollection[];
  onCollectionClick: (collection: DiscoveredCollection) => void;
}

function CollectionsList({ collections, onCollectionClick }: CollectionsListProps) {
  if (collections.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Nenhuma coleção encontrada</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {collections.map(collection => (
        <BrowseCollectionCardDiscovery
          key={collection.id}
          collection={collection}
          onClick={() => onCollectionClick(collection)}
        />
      ))}
    </div>
  );
}

interface ItemsListProps {
  items: DiscoveredItem[];
  onItemAction: (item: DiscoveredItem) => void;
}

function ItemsList({ items, onItemAction }: ItemsListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Nenhum item nesta coleção</p>
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${styles.itemsGrid}`}>
      {items.map(item => (
        <BrowseItemCardDiscovery
          key={item.id}
          item={item}
          onAction={() => onItemAction(item)}
        />
      ))}
    </div>
  );
}