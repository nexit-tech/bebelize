'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useCollections } from '@/hooks/useCollections';
import { useItems } from '@/hooks/useItems';
import { useCartContext } from '@/context/CartContext';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { CustomizedItem } from '@/types/customizedItem.types';
import type { LayerCustomization, BrasaoCustomization } from '@/types/rendering.types';
import Sidebar from '@/components/Sidebar/Sidebar';
import CatalogoItemCard from '@/components/CatalogoItemCard/CatalogoItemCard';
import ItemCustomizerModal from '@/components/ItemCustomizerModal/ItemCustomizerModal';
import styles from './catalogoItems.module.css';

interface PageProps {
  params: { slug: string };
}

export default function CatalogoItemsPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { collections } = useCollections();
  const { items, isLoading } = useItems(slug);
  const { updateCartItems, cartItems } = useCartContext();

  const [selectedItem, setSelectedItem] = useState<DiscoveredItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const collection = collections.find((c) => c.slug === slug);

  const handleGoBack = () => {
    router.push('/catalogo');
  };

  const handleItemClick = (item: DiscoveredItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleFinishCustomization = async (
    productItem: DiscoveredItem,
    customizations: LayerCustomization[],
    renderUrl: string,
    variantId?: string,
    brasao?: BrasaoCustomization
  ) => {
    try {
      // Criação do objeto tipado corretamente
      const newItem: CustomizedItem = {
        ...productItem,
        cartItemId: crypto.randomUUID(),
        item_id: productItem.id, // Agora isso é aceito pela interface!
        variant_id: variantId || null,
        name: productItem.name,
        quantity: 1,
        image_url: renderUrl, 
        base_image_url: renderUrl, 
        customization_data: {
          layers: customizations,
          brasao: brasao
        }
      };

      const newCartList = [...cartItems, newItem];
      await updateCartItems(newCartList);
      
      setIsModalOpen(false);
      setSelectedItem(null);

    } catch (error: any) {
      if (error.message === 'Usuário não autenticado') {
        alert('Por favor, faça login para adicionar itens ao projeto.');
      } else {
        console.error('Erro ao adicionar item:', error);
        alert('Erro ao salvar o item. Tente novamente.');
      }
    }
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

      {isModalOpen && selectedItem && (
        <ItemCustomizerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
          onAddToProject={handleFinishCustomization}
        />
      )}
    </div>
  );
}

// ... Resto dos componentes (Header, Grid, EmptyState) permanecem iguais
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