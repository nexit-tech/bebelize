'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useCollections, useItems } from '@/hooks';
import { Item } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import ItemCard from '@/components/ItemCard/ItemCard';
import ItemModal from '@/components/ItemModal/ItemModal';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from '../catalogo.module.css';

export default function CatalogoItensPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const { getCollectionById } = useCollections();
  const { items, isLoading, createItem, updateItem, deleteItem } = useItems(collectionId);

  const [collection, setCollection] = useState<any>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

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

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    const foundCollection = await getCollectionById(collectionId);
    if (foundCollection) {
      setCollection(foundCollection);
    } else {
      router.push('/catalogo');
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Item',
      message: 'Tem certeza que deseja excluir este item permanentemente?',
      onConfirm: async () => {
        const success = await deleteItem(itemId);
        if (success) {
          setSuccessModal({
            isOpen: true,
            title: 'Item Excluído!',
            message: 'O item foi removido da coleção.'
          });
        }
      }
    });
  };

  const handleSaveItem = async (data: { name: string; description: string; code: string }) => {
    if (editingItem) {
      const success = await updateItem(editingItem.id, data);
      if (success) {
        setSuccessModal({
          isOpen: true,
          title: 'Item Atualizado!',
          message: 'As informações do item foram atualizadas.'
        });
      }
    } else {
      const newItem = await createItem({
        collectionId: collectionId,
        name: data.name,
        description: data.description,
        code: data.code
      });
      if (newItem) {
        setSuccessModal({
          isOpen: true,
          title: 'Item Criado!',
          message: 'O novo item foi adicionado à coleção.'
        });
      }
    }
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  if (isLoading || !collection) {
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
          <div className={styles.headerLeft}>
            <button 
              className={styles.backButton}
              onClick={() => router.push('/catalogo')}
              aria-label="Voltar para coleções"
            >
              <FiArrowLeft size={20} />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className={styles.title}>{collection?.name}</h1>
              <p className={styles.subtitle}>{collection?.description}</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleCreateItem}>
            <FiPlus size={20} />
            Novo Item
          </Button>
        </header>

        <div className={styles.itemsGrid}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              code={item.code}
              onEdit={() => handleEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum item cadastrado</p>
            <p className={styles.emptySubtext}>Adicione o primeiro item a esta coleção</p>
          </div>
        )}

      </main>

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editData={editingItem}
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