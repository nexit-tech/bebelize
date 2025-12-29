'use client';

import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiBox } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Button from '../Button/Button';
import styles from './ProjetoCarrinhoDiscovery.module.css';

export interface CartItem {
  id: string;
  item: DiscoveredItem;
  customizations: LayerCustomization[];
  renderUrl: string;
  variantId?: string;
}

interface ProjetoCarrinhoDiscoveryProps {
  items: CartItem[];
  onItemsChange: (items: CartItem[]) => void;
  onBrowseMore: () => void;
  // Nova prop opcional para delegar a edição ao pai
  onEditItem?: (item: CartItem) => void; 
}

export default function ProjetoCarrinhoDiscovery({
  items,
  onItemsChange,
  onBrowseMore,
  onEditItem
}: ProjetoCarrinhoDiscoveryProps) {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null
  });

  const handleEditClick = (cartItem: CartItem) => {
    if (onEditItem) {
      onEditItem(cartItem);
    } else {
      console.warn('Handler de edição não fornecido para ProjetoCarrinhoDiscovery');
    }
  };

  const handleRemoveClick = (cartItemId: string) => {
    setDeleteModal({ isOpen: true, itemId: cartItemId });
  };

  const confirmRemoveItem = () => {
    if (deleteModal.itemId) {
      onItemsChange(items.filter(i => i.id !== deleteModal.itemId));
    }
    setDeleteModal({ isOpen: false, itemId: null });
  };

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <div className={styles.cartTitleGroup}>
          <FiBox className={styles.titleIcon} />
          <h3 className={styles.cartTitle}>Itens do Enxoval</h3>
          <span className={styles.itemBadge}>{items.length}</span>
        </div>
        <Button variant="secondary" onClick={onBrowseMore}>
          <FiPlus style={{ marginRight: 8 }} /> Adicionar Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Nenhum item adicionado ainda.</p>
          <span className={styles.browseLink} onClick={onBrowseMore}>
            Clique aqui para abrir o catálogo
          </span>
        </div>
      ) : (
        <div className={styles.cartGrid}>
          {items.map((cartItem) => (
            <div key={cartItem.id} className={styles.cartCard}>
              <div className={styles.itemPreview}>
                <img 
                  src={cartItem.renderUrl} 
                  alt={cartItem.item.name} 
                  loading="lazy"
                />
              </div>
              
              <div className={styles.itemDetails}>
                <h4 className={styles.itemName}>{cartItem.item.name}</h4>
                <p className={styles.itemMeta}>
                  {cartItem.variantId 
                    ? `Variante: ${cartItem.item.variants?.find(v => v.id === cartItem.variantId)?.name || cartItem.variantId}` 
                    : 'Configuração Padrão'}
                </p>
                
                <div className={styles.cardActions}>
                  <button 
                    className={`${styles.iconBtn} ${styles.editBtn}`}
                    onClick={() => handleEditClick(cartItem)}
                    type="button"
                  >
                    <FiEdit3 size={16} /> Editar
                  </button>
                  <button 
                    className={`${styles.iconBtn} ${styles.deleteBtn}`}
                    onClick={() => handleRemoveClick(cartItem.id)}
                    type="button"
                  >
                    <FiTrash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
        onConfirm={confirmRemoveItem}
        title="Remover Item"
        message="Tem certeza que deseja remover este item do projeto? Esta ação não pode ser desfeita."
        type="danger"
        confirmText="Sim, Remover"
        cancelText="Cancelar"
      />
    </div>
  );
}