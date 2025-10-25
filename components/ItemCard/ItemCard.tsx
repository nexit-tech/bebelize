import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  id: string;
  name: string;
  description: string;
  code: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ItemCard({
  id,
  name,
  description,
  code,
  onEdit,
  onDelete
}: ItemCardProps) {
  return (
    <div className={styles.card}>
      
      {/* Header */}
      <div className={styles.cardHeader}>
        <h4 className={styles.itemName}>{name}</h4>
        <span className={styles.itemCode}>#{code}</span>
      </div>

      {/* Descrição */}
      <p className={styles.description}>{description}</p>

      {/* Ações */}
      <div className={styles.cardActions}>
        <button 
          className={styles.actionButton}
          onClick={onEdit}
          aria-label="Editar item"
        >
          <FiEdit2 size={16} />
          <span>Editar</span>
        </button>

        <button 
          className={`${styles.actionButton} ${styles.danger}`}
          onClick={onDelete}
          aria-label="Excluir item"
        >
          <FiTrash2 size={16} />
          <span>Excluir</span>
        </button>
      </div>

    </div>
  );
}