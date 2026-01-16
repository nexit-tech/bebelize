'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiEdit3, FiLayers, FiShield } from 'react-icons/fi';
import { CustomizedItem } from '@/types/customizedItem.types';
import styles from './CartItemCardDiscovery.module.css';

interface CartItemCardDiscoveryProps {
  item: CustomizedItem;
  onRemove: (cartItemId: string) => void;
}

export default function CartItemCardDiscovery({ item, onRemove }: CartItemCardDiscoveryProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/projeto/personalizar/${item.item_id}?edit=${item.cartItemId}`);
  };

  const layerCount = item.customization_data?.layers?.length || 0;
  const hasBrasao = !!item.customization_data?.brasao;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {item.base_image_url ? (
          <img 
            src={item.base_image_url} 
            alt={item.name} 
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            Sem imagem
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{item.name}</h3>
          <span className={styles.price}>
             Sob Consulta
          </span>
        </div>

        <div className={styles.details}>
          {item.variant_id && (
            <span className={styles.variantBadge}>
              Modelo: {item.variant_id}
            </span>
          )}
          
          <div className={styles.specs}>
            <span className={styles.specItem} title="Camadas personalizadas">
              <FiLayers size={14} /> {layerCount} camada{layerCount !== 1 ? 's' : ''}
            </span>
            
            {hasBrasao && (
              <span className={`${styles.specItem} ${styles.highlight}`} title="Brasão aplicado">
                <FiShield size={14} /> Com Brasão
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleEdit} 
            className={styles.editButton}
            title="Editar personalização"
          >
            <FiEdit3 size={16} />
            <span>Editar</span>
          </button>
          
          <div className={styles.divider} />
          
          <button 
            onClick={() => onRemove(item.cartItemId!)} 
            className={styles.removeButton}
            title="Remover item"
          >
            <FiTrash2 size={16} />
            <span>Remover</span>
          </button>
        </div>
      </div>
    </div>
  );
}