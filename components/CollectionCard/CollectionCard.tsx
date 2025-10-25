import React from 'react';
import { FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import styles from './CollectionCard.module.css';

interface CollectionCardProps {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdAt: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export default function CollectionCard({
  id,
  name,
  description,
  itemCount,
  createdAt,
  onEdit,
  onDelete,
  onClick
}: CollectionCardProps) {
  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>
          <FiPackage size={24} />
        </div>
        <h3 className={styles.collectionName}>{name}</h3>
      </div>

      {/* Descrição */}
      <p className={styles.description}>{description}</p>

      {/* Informações */}
      <div className={styles.infoRow}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Itens:</span>
          <span className={styles.infoValue}>{itemCount}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Criado:</span>
          <span className={styles.infoValue}>{createdAt}</span>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.cardActions}>
        <button 
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="Editar coleção"
        >
          <FiEdit2 size={16} />
          <span>Editar</span>
        </button>

        <button 
          className={`${styles.actionButton} ${styles.danger}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Excluir coleção"
        >
          <FiTrash2 size={16} />
          <span>Excluir</span>
        </button>
      </div>

    </div>
  );
}