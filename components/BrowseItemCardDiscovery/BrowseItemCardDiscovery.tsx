'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaImage, FaCheck } from 'react-icons/fa';
import styles from './BrowseItemCardDiscovery.module.css';
import { DiscoveredItem, DiscoveredVariant } from '@/lib/discovery/types';

interface BrowseItemCardDiscoveryProps {
  item: DiscoveredItem;
  onAction: (item: DiscoveredItem, selectedVariant?: DiscoveredVariant) => void;
  isProcessing?: boolean;
}

export default function BrowseItemCardDiscovery({
  item,
  onAction,
  isProcessing = false
}: BrowseItemCardDiscoveryProps) {
  const [selectedVariant, setSelectedVariant] = useState<DiscoveredVariant | null>(null);

  useEffect(() => {
    if (item.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0]);
    }
  }, [item]);

  const formatLabel = (name: string) => {
    if (name.toLowerCase().startsWith('opc')) {
      const number = name.replace(/\D/g, '');
      return `Opção ${number}`;
    }
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleVariantClick = (e: React.MouseEvent, variant: DiscoveredVariant) => {
    e.stopPropagation();
    setSelectedVariant(variant);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(item, selectedVariant || undefined);
  };

  const displayImage = selectedVariant?.previewUrl || item.previewUrl || item.image_url;
  const displayName = selectedVariant 
    ? `${item.name} - ${formatLabel(selectedVariant.name)}`
    : item.name;

  const hasVariants = item.variants && item.variants.length > 1;

  return (
    <div className={styles.card}>
      <div className={styles.imageStage}>
        {displayImage ? (
          <div className={styles.imageWrapper}>
            <Image 
              src={displayImage} 
              alt={displayName} 
              fill
              className={styles.image}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              priority={false}
            />
          </div>
        ) : (
          <div className={styles.noImage}>
            <div className={styles.noImageIcon}>
              <FaImage size={20} />
            </div>
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {item.category && (
              <span className={styles.categoryTag}>{item.category}</span>
            )}
            <h3 className={styles.title} title={item.name}>
              {item.name}
            </h3>
          </div>
        </div>

        {hasVariants && (
          <div className={styles.variantsSection}>
            <span className={styles.variantLabel}>Modelos disponíveis:</span>
            <div className={styles.variantList}>
              {item.variants.map((variant) => {
                const isActive = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id || variant.name}
                    onClick={(e) => handleVariantClick(e, variant)}
                    className={`${styles.variantChip} ${isActive ? styles.activeChip : ''}`}
                    type="button"
                    title={formatLabel(variant.name)}
                  >
                    {formatLabel(variant.name)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={handleActionClick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className={styles.loadingText}>Processando...</span>
            ) : (
              <>
                <FaPlus size={10} />
                <span>Adicionar ao Projeto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}