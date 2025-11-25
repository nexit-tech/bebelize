'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { useCollections } from '@/hooks';
import { Collection } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import CollectionCard from '@/components/CollectionCard/CollectionCard';
import CollectionModal from '@/components/CollectionModal/CollectionModal';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './catalogo.module.css';

export default function CatalogoPage() {
  const router = useRouter();
  const { collections, isLoading, createCollection, updateCollection, deleteCollection } = useCollections();

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setIsCollectionModalOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setIsCollectionModalOpen(true);
  };

  const handleDeleteCollection = (collectionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Coleção',
      message: 'Tem certeza? Todos os itens associados também serão removidos.',
      onConfirm: async () => {
        const success = await deleteCollection(collectionId);
        if (success) {
          setSuccessModal({
            isOpen: true,
            title: 'Coleção Excluída!',
            message: 'A coleção e seus itens foram removidos.'
          });
        }
      }
    });
  };

  const handleSaveCollection = async (data: { name: string; description: string }) => {
    if (editingCollection) {
      const success = await updateCollection(editingCollection.id, data);
      if (success) {
        setSuccessModal({
          isOpen: true,
          title: 'Coleção Atualizada!',
          message: 'As informações da coleção foram atualizadas.'
        });
      }
    } else {
      const newCollection = await createCollection({ name: data.name, theme: '', description: data.description });
      if (newCollection) {
        setSuccessModal({
          isOpen: true,
          title: 'Coleção Criada!',
          message: 'A nova coleção foi adicionada ao catálogo.'
        });
      }
    }
    setIsCollectionModalOpen(false);
    setEditingCollection(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <p>Carregando...</p>
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
            <h1 className={styles.title}>Gerenciamento de Catálogo</h1>
            <p className={styles.subtitle}>Crie e gerencie coleções e itens do enxoval</p>
          </div>
          <Button variant="primary" onClick={handleCreateCollection}>
            <FiPlus size={20} />
            Nova Coleção
          </Button>
        </header>

        <div className={styles.collectionsGrid}>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              name={collection.name}
              description={collection.description}
              itemCount={collection.itemCount}
              createdAt={formatDate(collection.createdAt)}
              onEdit={() => handleEditCollection(collection)}
              onDelete={() => handleDeleteCollection(collection.id)}
              onClick={() => router.push(`/catalogo/${collection.id}`)}
            />
          ))}
        </div>

        {collections.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhuma coleção cadastrada</p>
            <p className={styles.emptySubtext}>Crie sua primeira coleção para começar</p>
          </div>
        )}
      </main>

      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSave={handleSaveCollection}
        editData={editingCollection}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}