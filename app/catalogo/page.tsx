'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';
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
      title: 'Sincronização Concluída',
      message: 'O catálogo foi atualizado com os itens mais recentes do storage.'
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
          <div className={styles.loading}>Carregando catálogo...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Catálogo de Coleções</h1>
            <p className={styles.subtitle}>
              Visualize as coleções e itens disponíveis no storage
            </p>
          </div>
          <Button variant="secondary" onClick={handleRefresh}>
            <FiRefreshCw size={18} />
            Sincronizar
          </Button>
        </header>

        <div className={styles.collectionsGrid}>
          {collections.map((collection) => (
            <CatalogoCollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => handleCollectionClick(collection)}
            />
          ))}
        </div>

        {collections.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhuma coleção encontrada</p>
            <p className={styles.emptySubtext}>
              Verifique se existem pastas no bucket do storage
            </p>
          </div>
        )}
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