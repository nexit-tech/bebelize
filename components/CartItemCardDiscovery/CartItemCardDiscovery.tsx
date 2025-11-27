import React from 'react';
import { FiTrash2, FiLayers, FiImage } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import styles from './CartItemCardDiscovery.module.css';

interface CartItem {
  cartItemId: string;
  item: DiscoveredItem;
  customizations?: LayerCustomization[];
  renderUrl?: string;
}

interface CartItemCardDiscoveryProps {
  cartItem: CartItem;
  onRemove: () => void;
}

export default function CartItemCardDiscovery({
  cartItem,
  onRemove
}: CartItemCardDiscoveryProps) {
  const { item, customizations } = cartItem;
  const isComposite = item.item_type === 'composite';
  const customizationCount = customizations?.length || 0;

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
        <div className={styles.itemDetails}>
          <span className={styles.itemType}>
            {isComposite ? 'Personalizável' : 'Item Simples'}
          </span>
          {customizationCount > 0 && (
            <span style={{ fontSize: '11px', color: '#A68E80', marginLeft: '8px' }}>
              • {customizationCount} {customizationCount === 1 ? 'item alterado' : 'itens alterados'}
            </span>
          )}
        </div>
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