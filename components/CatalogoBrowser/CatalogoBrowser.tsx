'use client';

import React, { useState, useMemo } from 'react';
import { FiCheck, FiLayers } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import { useItemsDiscovery } from '@/hooks/useItemsDiscovery';
import SearchBar from '../SearchBar/SearchBar';
import BrowseItemCardDiscovery from '../BrowseItemCardDiscovery/BrowseItemCardDiscovery';
import Button from '../Button/Button';
import BulkCustomizerModal from '../BulkCustomizerModal/BulkCustomizerModal';
import styles from './CatalogoBrowser.module.css';

interface CatalogoBrowserProps {
  onSelectSimpleItem: (item: DiscoveredItem) => void;
  onCustomizeCompositeItem: (item: DiscoveredItem) => void;
  onAddBulkItems?: (items: { item: DiscoveredItem, customizations: LayerCustomization[], renderUrl: string }[]) => void;
}

export default function CatalogoBrowser({ 
  onSelectSimpleItem, 
  onCustomizeCompositeItem,
  onAddBulkItems
}: CatalogoBrowserProps) {
  const { items, isLoading } = useItemsDiscovery();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const toggleSelection = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    
    const newSelection = new Set(selectedIds);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredItems.map(i => i.id));
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkCustomizeClick = () => {
    setIsBulkModalOpen(true);
  };

  const handleBulkConfirm = (results: { item: DiscoveredItem, customizations: LayerCustomization[], renderUrl: string }[]) => {
    if (onAddBulkItems) {
      onAddBulkItems(results);
    }
    handleClearSelection();
  };

  const handleCardClick = (item: DiscoveredItem) => {
    if (selectedIds.size > 0) {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      setSelectedIds(newSelection);
      return;
    }

    const hasLayers = item.layers && item.layers.length > 0 && item.layers.some(l => l.type !== 'fixed');
    
    if (hasLayers) {
      onCustomizeCompositeItem(item);
    } else {
      onSelectSimpleItem(item);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Carregando catálogo...</div>;
  }

  const selectedItemsList = items.filter(i => selectedIds.has(i.id));
  const hasSelection = selectedIds.size > 0;

  return (
    <div className={styles.container}>
      <SearchBar 
        placeholder="Buscar itens..." 
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {hasSelection && (
        <div className={styles.selectionToolbar}>
          <div className={styles.selectionInfo}>
            <div className={styles.selectionCount}>
              {selectedIds.size}
            </div>
            <span className={styles.selectionLabel}>itens selecionados</span>
            <div className={styles.divider} />
            <button className={styles.textButton} onClick={handleSelectAll}>
              Selecionar Tudo
            </button>
            <button className={styles.textButton} onClick={handleClearSelection}>
              Limpar
            </button>
          </div>

          <div className={styles.selectionActions}>
             <Button 
               variant="primary" 
               onClick={handleBulkCustomizeClick}
             >
               <FiLayers size={16} />
               Personalizar ({selectedIds.size})
             </Button>
          </div>
        </div>
      )}

      <div className={styles.scrollArea}>
        <div className={styles.categorySection}>
          <h3 className={styles.categoryTitle}>
            Todos os Itens
            <span className={styles.itemCount}>{filteredItems.length} itens</span>
          </h3>
          
          <div className={styles.grid}>
            {filteredItems.map(item => {
              const isSelected = selectedIds.has(item.id);
              
              return (
                <div 
                  key={item.id} 
                  className={`${styles.cardWrapper} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleCardClick(item)}
                >
                  <div 
                    className={styles.checkboxOverlay}
                    onClick={(e) => toggleSelection(e, item.id)}
                  >
                    {isSelected && <FiCheck size={14} color="#FFF" />}
                  </div>

                  <BrowseItemCardDiscovery 
                    item={item} 
                    onAction={() => handleCardClick(item)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {filteredItems.length === 0 && (
          <p className={styles.emptyState}>Nenhum item encontrado.</p>
        )}
      </div>

      <BulkCustomizerModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        items={selectedItemsList}
        onConfirm={handleBulkConfirm}
      />
    </div>
  );
}