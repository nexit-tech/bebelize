'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { useCollections } from '@/hooks/useCollections';
import type { DiscoveredCollection } from '@/lib/discovery/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import CatalogoCollectionCard from '@/components/CatalogoCollectionCard/CatalogoCollectionCard';
import styles from './catalogo.module.css';

export default function CatalogoPage() {
  const router = useRouter();
  const { collections, isLoading, refresh } = useCollections();

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleCollectionClick = (collection: DiscoveredCollection) => {
    router.push(`/catalogo/${collection.slug}`);
  };

  const handleRefresh = async () => {
    await refresh(true);
    setSuccessModal({
      isOpen: true,
      title: 'Catálogo Atualizado!',
      message: 'As coleções foram sincronizadas com o storage.'
    });
  };

  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.loading}>Carregando coleções...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <Header onRefresh={handleRefresh} />

        <CollectionsGrid
          collections={collections}
          onCollectionClick={handleCollectionClick}
        />

        {collections.length === 0 && <EmptyState />}
      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleCloseModal}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}

interface HeaderProps {
  onRefresh: () => void;
}

function Header({ onRefresh }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Catálogo de Coleções</h1>
        <p className={styles.subtitle}>
          Visualize as coleções e itens disponíveis no storage
        </p>
      </div>
      <Button variant="secondary" onClick={onRefresh}>
        <FiPlus size={20} />
        Sincronizar
      </Button>
    </header>
  );
}

interface CollectionsGridProps {
  collections: DiscoveredCollection[];
  onCollectionClick: (collection: DiscoveredCollection) => void;
}

function CollectionsGrid({ collections, onCollectionClick }: CollectionsGridProps) {
  return (
    <div className={styles.collectionsGrid}>
      {collections.map((collection) => (
        <CatalogoCollectionCard
          key={collection.id}
          collection={collection}
          onClick={() => onCollectionClick(collection)}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>Nenhuma coleção encontrada</p>
      <p className={styles.emptySubtext}>
        Verifique se existem pastas no bucket do storage
      </p>
    </div>
  );
}