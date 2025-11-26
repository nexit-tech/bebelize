'use client';

import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import Input from '../Input/Input';
import CartItemCardDiscovery from '../CartItemCardDiscovery/CartItemCardDiscovery';
import styles from './ProjetoCarrinhoDiscovery.module.css';

export interface CartItem {
  cartItemId: string;
  item: DiscoveredItem;
  customizations?: LayerCustomization[];
  renderUrl?: string;
}

interface ProjetoCarrinhoDiscoveryProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
}

export default function ProjetoCarrinhoDiscovery({
  projectName,
  onProjectNameChange,
  cartItems,
  onRemoveItem
}: ProjetoCarrinhoDiscoveryProps) {
  return (
    <div className={styles.container}>
      <Input
        type="text"
        id="projectName"
        label="Nome do Projeto"
        placeholder="Ex: Enxoval - Maria Alice"
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        required
      />

      <div className={styles.cartHeader}>
        <h3 className={styles.title}>Itens do Projeto</h3>
        <span className={styles.itemCount}>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <CartList cartItems={cartItems} onRemoveItem={onRemoveItem} />
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className={styles.emptyState}>
      <FiShoppingCart size={64} className={styles.emptyIcon} />
      <p className={styles.emptyText}>Carrinho Vazio</p>
      <p className={styles.emptySubtext}>Adicione itens do catálogo ao lado.</p>
    </div>
  );
}

interface CartListProps {
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
}

function CartList({ cartItems, onRemoveItem }: CartListProps) {
  return (
    <div className={styles.list}>
      {cartItems.map(cartItem => (
        <CartItemCardDiscovery
          key={cartItem.cartItemId}
          cartItem={cartItem}
          onRemove={() => onRemoveItem(cartItem.cartItemId)}
        />
      ))}
    </div>
  );
}