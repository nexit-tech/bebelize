import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { Item } from '@/types';
import Button from '../Button/Button';
import styles from './BrowseItemCard.module.css';

interface BrowseItemCardProps {
  item: Item;
  onCustomizeItem: (item: Item) => void;
}

export default function BrowseItemCard({
  item,
  onCustomizeItem
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
          onClick={() => onCustomizeItem(item)}
          fullWidth
        >
          <FiPlus size={16} />
          <span>Personalizar</span>
        </Button>
      </div>
    </div>
  );
}