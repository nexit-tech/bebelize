'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useCollections } from '@/hooks/useCollections';
import { useItems } from '@/hooks/useItems';
import type { DiscoveredItem } from '@/lib/discovery/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import CatalogoItemCard from '@/components/CatalogoItemCard/CatalogoItemCard';
import styles from './catalogoItems.module.css';

interface PageProps {
  params: { slug: string };
}

export default function CatalogoItemsPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { collections } = useCollections();
  const { items, isLoading } = useItems(slug);

  const collection = collections.find((c) => c.slug === slug);

  const handleGoBack = () => {
    router.push('/catalogo');
  };

  const handleItemClick = (item: DiscoveredItem) => {
    console.log('Item selecionado:', item);
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.loading}>Carregando itens...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <Header
          collectionName={collection?.name ?? slug}
          itemCount={items.length}
          onGoBack={handleGoBack}
        />

        <ItemsGrid items={items} onItemClick={handleItemClick} />

        {items.length === 0 && <EmptyState />}
      </main>
    </div>
  );
}

interface HeaderProps {
  collectionName: string;
  itemCount: number;
  onGoBack: () => void;
}

function Header({ collectionName, itemCount, onGoBack }: HeaderProps) {
  const itemLabel = itemCount === 1 ? 'item' : 'itens';

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onGoBack}
        aria-label="Voltar para coleções"
      >
        <FiArrowLeft size={20} />
      </button>

      <div>
        <h1 className={styles.title}>{collectionName}</h1>
        <p className={styles.subtitle}>
          {itemCount} {itemLabel} disponíveis
        </p>
      </div>
    </header>
  );
}

interface ItemsGridProps {
  items: DiscoveredItem[];
  onItemClick: (item: DiscoveredItem) => void;
}

function ItemsGrid({ items, onItemClick }: ItemsGridProps) {
  return (
    <div className={styles.itemsGrid}>
      {items.map((item) => (
        <CatalogoItemCard
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>Nenhum item encontrado</p>
      <p className={styles.emptySubtext}>
        Esta coleção ainda não possui itens no storage
      </p>
    </div>
  );
}