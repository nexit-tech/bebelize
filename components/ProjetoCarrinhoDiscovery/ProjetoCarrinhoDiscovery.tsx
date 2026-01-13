'use client';

import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiBox, FiShoppingBag } from 'react-icons/fi';
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
  onEditItem?: (item: CartItem) => void;
  showTitle?: boolean; // Nova prop
  compact?: boolean;   // Nova prop
}

export default function ProjetoCarrinhoDiscovery({
  items,
  onItemsChange,
  onBrowseMore,
  onEditItem,
  showTitle = true,
  compact = false
}: ProjetoCarrinhoDiscoveryProps) {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null
  });

  const handleEditClick = (cartItem: CartItem) => {
    if (onEditItem) {
      onEditItem(cartItem);
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

  // Classes condicionais para o container principal
  const containerClasses = [
    styles.cartContainer,
    compact ? styles.compact : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      
      {/* Cabeçalho Condicional */}
      {showTitle && (
        <div className={styles.cartHeader}>
          <div className={styles.cartTitleGroup}>
            <div className={styles.iconWrapper}>
              <FiBox size={20} />
            </div>
            <div>
              <h3 className={styles.cartTitle}>Itens Selecionados</h3>
              <p className={styles.cartSubtitle}>Gerencie os produtos deste enxoval</p>
            </div>
          </div>
          
          {items.length > 0 && !compact && (
            <Button variant="secondary" size="small" onClick={onBrowseMore}>
              <FiPlus /> Adicionar Mais
            </Button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyIconCircle}>
            <FiShoppingBag size={compact ? 32 : 48} />
          </div>
          <h4 className={styles.emptyTitle}>
            {compact ? 'Carrinho vazio' : 'Seu projeto está vazio'}
          </h4>
          {!compact && (
            <>
              <p className={styles.emptyText}>
                Comece adicionando itens do catálogo para montar o enxoval personalizado.
              </p>
              <Button variant="primary" size="large" onClick={onBrowseMore}>
                <FiPlus size={20} /> Navegar no Catálogo
              </Button>
            </>
          )}
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
                <div className={styles.itemBadge}>
                  {cartItem.customizations.length > 0 ? 'Personalizado' : 'Padrão'}
                </div>
              </div>
              
              <div className={styles.itemDetails}>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{cartItem.item.name}</h4>
                  <p className={styles.itemVariant}>
                    {cartItem.variantId 
                      ? `Variante: ${cartItem.item.variants?.find(v => v.id === cartItem.variantId)?.name || 'Selecionada'}` 
                      : 'Configuração Base'}
                  </p>
                </div>
                
                <div className={styles.cardActions}>
                  <button 
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => handleEditClick(cartItem)}
                    type="button"
                    title="Editar personalização"
                  >
                    <FiEdit3 size={16} /> {compact ? '' : 'Editar'}
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleRemoveClick(cartItem.id)}
                    type="button"
                    title="Remover do projeto"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Ocultamos o card gigante de "Adicionar" no modo compacto */}
          {!compact && (
            <button className={styles.addMoreCard} onClick={onBrowseMore}>
              <div className={styles.addMoreIcon}>
                <FiPlus size={32} />
              </div>
              <span>Adicionar outro item</span>
            </button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
        onConfirm={confirmRemoveItem}
        title="Remover Item"
        message="Tem certeza que deseja remover este item do projeto?"
        type="danger"
        confirmText="Sim, Remover"
        cancelText="Manter"
      />
    </div>
  );
}