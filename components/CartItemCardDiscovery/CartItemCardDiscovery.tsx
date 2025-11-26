import React from 'react';
import { FiTrash2, FiLayers, FiImage } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import styles from './CartItemCardDiscovery.module.css';

interface CartItem {
  cartItemId: string;
  item: DiscoveredItem;
  customizations?: Record<string, string>;
}

interface CartItemCardDiscoveryProps {
  cartItem: CartItem;
  onRemove: () => void;
}

export default function CartItemCardDiscovery({
  cartItem,
  onRemove
}: CartItemCardDiscoveryProps) {
  const { item } = cartItem;
  const isComposite = item.item_type === 'composite';

  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        {isComposite ? (
          <FiLayers size={20} className={styles.icon} />
        ) : (
          <FiImage size={20} className={styles.icon} />
        )}
      </div>

      <div className={styles.itemInfo}>
        <h5 className={styles.itemName}>{item.name}</h5>
        <span className={styles.itemType}>
          {isComposite ? 'Personalizável' : 'Item Simples'}
        </span>
      </div>

      <button
        className={styles.removeButton}
        onClick={onRemove}
        aria-label={`Remover ${item.name}`}
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}