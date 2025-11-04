import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { Item } from '@/types';
import Button from '../Button/Button';
import styles from './BrowseItemCard.module.css';

interface BrowseItemCardProps {
  item: Item;
  onAddItem: (item: Item) => void;
}

export default function BrowseItemCard({
  item,
  onAddItem
}: BrowseItemCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h4 className={styles.itemName}>{item.name}</h4>
        <span className={styles.itemCode}>#{item.code}</span>
      </div>

      <p className={styles.description}>{item.description}</p>

      <div className={styles.cardFooter}>
        <Button 
          variant="secondary" 
          size="small" 
          onClick={() => onAddItem(item)}
          fullWidth
        >
          <FiPlus size={16} />
          <span>Adicionar</span>
        </Button>
      </div>
    </div>
  );
}