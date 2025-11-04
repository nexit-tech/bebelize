import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { Item } from '@/types';
import styles from './CartItemCard.module.css';

interface CartItemCardProps {
  item: Item;
  onRemove: (itemId: string) => void;
}

export default function CartItemCard({ item, onRemove }: CartItemCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.itemInfo}>
        <h5 className={styles.itemName}>{item.name}</h5>
        <span className={styles.itemCode}>#{item.code}</span>
      </div>
      <button
        className={styles.removeButton}
        onClick={() => onRemove(item.id)}
        aria-label={`Remover ${item.name}`}
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}