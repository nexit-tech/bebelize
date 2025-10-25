'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import CollectionCard from '@/components/CollectionCard/CollectionCard';
import CollectionModal from '@/components/CollectionModal/CollectionModal';
import ItemCard from '@/components/ItemCard/ItemCard';
import ItemModal from '@/components/ItemModal/ItemModal';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './catalogo.module.css';

export default function CatalogoPage() {
  const router = useRouter();

  // Estados - Coleções
  const [collections, setCollections] = useState([
    {
      id: '1',
      name: 'Coleção Anjos',
      description: 'Peças delicadas com tema celestial',
      itemCount: 12,
      createdAt: '10/09/2024'
    },
    {
      id: '2',
      name: 'Coleção Essencial',
      description: 'Itens básicos e práticos para o dia a dia',
      itemCount: 8,
      createdAt: '15/08/2024'
    },
    {
      id: '3',
      name: 'Coleção Premium',
      description: 'Enxoval completo de luxo',
      itemCount: 15,
      createdAt: '01/07/2024'
    }
  ]);

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  // Estados - Itens
  const [items, setItems] = useState([
    {
      id: '1',
      collectionId: '1',
      name: 'Kit Berço Premium',
      description: 'Kit completo com protetor e lençol',
      code: 'ITEM-001'
    },
    {
      id: '2',
      collectionId: '1',
      name: 'Manta Bordada',
      description: 'Manta em algodão egípcio',
      code: 'ITEM-002'
    },
    {
      id: '3',
      collectionId: '1',
      name: 'Almofada Decorativa',
      description: 'Almofada com tema anjos',
      code: 'ITEM-003'
    }
  ]);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Estados dos Modais
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' as 'warning' | 'success' | 'info' | 'danger'
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Handlers - Coleções
  const handleCreateCollection = () => {
    setEditingCollection(null);
    setIsCollectionModalOpen(true);
  };

  const handleEditCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      setEditingCollection(collection);
      setIsCollectionModalOpen(true);
    }
  };

  const handleDeleteCollection = (collectionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Coleção',
      message: 'Tem certeza que deseja excluir esta coleção? Todos os itens associados também serão removidos permanentemente.',
      type: 'danger',
      onConfirm: () => {
        setCollections(collections.filter(c => c.id !== collectionId));
        if (selectedCollection === collectionId) {
          setSelectedCollection(null);
        }
        setSuccessModal({
          isOpen: true,
          title: 'Coleção Excluída!',
          message: 'A coleção e todos os seus itens foram removidos com sucesso.'
        });
      }
    });
  };

  const handleSaveCollection = (data: { name: string; description: string }) => {
    if (editingCollection) {
      setCollections(collections.map(c => 
        c.id === editingCollection.id 
          ? { ...c, name: data.name, description: data.description }
          : c
      ));
      setSuccessModal({
        isOpen: true,
        title: 'Coleção Atualizada!',
        message: 'As informações da coleção foram atualizadas com sucesso.'
      });
    } else {
      const newCollection = {
        id: String(collections.length + 1),
        name: data.name,
        description: data.description,
        itemCount: 0,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setCollections([...collections, newCollection]);
      setSuccessModal({
        isOpen: true,
        title: 'Coleção Criada!',
        message: 'A nova coleção foi adicionada ao catálogo com sucesso.'
      });
    }
    setIsCollectionModalOpen(false);
    setEditingCollection(null);
  };

  // Handlers - Itens
  const handleCreateItem = () => {
    if (!selectedCollection) {
      setSuccessModal({
        isOpen: true,
        title: 'Atenção',
        message: 'Selecione uma coleção antes de adicionar um item.'
      });
      return;
    }
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setEditingItem(item);
      setIsItemModalOpen(true);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Item',
      message: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: () => {
        setItems(items.filter(i => i.id !== itemId));
        setSuccessModal({
          isOpen: true,
          title: 'Item Excluído!',
          message: 'O item foi removido da coleção com sucesso.'
        });
      }
    });
  };

  const handleSaveItem = (data: { name: string; description: string; code: string }) => {
    if (editingItem) {
      setItems(items.map(i => 
        i.id === editingItem.id 
          ? { ...i, name: data.name, description: data.description, code: data.code }
          : i
      ));
      setSuccessModal({
        isOpen: true,
        title: 'Item Atualizado!',
        message: 'As informações do item foram atualizadas com sucesso.'
      });
    } else {
      const newItem = {
        id: String(items.length + 1),
        collectionId: selectedCollection!,
        name: data.name,
        description: data.description,
        code: data.code
      };
      setItems([...items, newItem]);
      setSuccessModal({
        isOpen: true,
        title: 'Item Criado!',
        message: 'O novo item foi adicionado à coleção com sucesso.'
      });
    }
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  // Filtrar itens da coleção selecionada
  const selectedCollectionItems = selectedCollection 
    ? items.filter(item => item.collectionId === selectedCollection)
    : [];

  const selectedCollectionData = collections.find(c => c.id === selectedCollection);

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        
        {!selectedCollection ? (
          // Visualização: Lista de Coleções
          <>
            {/* Header */}
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

            {/* Grid de Coleções */}
            <div className={styles.collectionsGrid}>
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  id={collection.id}
                  name={collection.name}
                  description={collection.description}
                  itemCount={collection.itemCount}
                  createdAt={collection.createdAt}
                  onEdit={() => handleEditCollection(collection.id)}
                  onDelete={() => handleDeleteCollection(collection.id)}
                  onClick={() => setSelectedCollection(collection.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {collections.length === 0 && (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Nenhuma coleção cadastrada</p>
                <p className={styles.emptySubtext}>Crie sua primeira coleção para começar</p>
              </div>
            )}
          </>
        ) : (
          // Visualização: Itens da Coleção
          <>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.headerLeft}>
                <button 
                  className={styles.backButton}
                  onClick={() => setSelectedCollection(null)}
                  aria-label="Voltar para coleções"
                >
                  <FiArrowLeft size={20} />
                  <span>Voltar</span>
                </button>
                <div>
                  <h1 className={styles.title}>{selectedCollectionData?.name}</h1>
                  <p className={styles.subtitle}>{selectedCollectionData?.description}</p>
                </div>
              </div>
              <Button variant="primary" onClick={handleCreateItem}>
                <FiPlus size={20} />
                Novo Item
              </Button>
            </header>

            {/* Grid de Itens */}
            <div className={styles.itemsGrid}>
              {selectedCollectionItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  code={item.code}
                  onEdit={() => handleEditItem(item.id)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {selectedCollectionItems.length === 0 && (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Nenhum item cadastrado</p>
                <p className={styles.emptySubtext}>Adicione itens a esta coleção</p>
              </div>
            )}
          </>
        )}

      </main>

      {/* Modais */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        editData={editingCollection}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editData={editingItem}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
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