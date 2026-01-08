'use client';

import React, { useState, useMemo } from 'react';
import { FiCheck, FiLayers, FiFolder, FiArrowLeft, FiSearch, FiGrid } from 'react-icons/fi';
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

type ViewMode = 'collections' | 'items';

export default function CatalogoBrowser({ 
  onSelectSimpleItem, 
  onCustomizeCompositeItem,
  onAddBulkItems
}: CatalogoBrowserProps) {
  const { items, isLoading } = useItemsDiscovery();
  
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // 1. Agrupar Coleções
  const collections = useMemo(() => {
    const map = new Map<string, { count: number, preview: string | null }>();
    
    items.forEach(item => {
      const colId = item.collection_id || 'outros';
      const current = map.get(colId) || { count: 0, preview: null };
      
      map.set(colId, {
        count: current.count + 1,
        // Pega a primeira imagem válida como capa da coleção
        preview: current.preview || item.image_url || null
      });
    });

    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      name: formatCollectionName(id),
      count: data.count,
      preview: data.preview
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // 2. Filtrar Itens da Coleção Ativa
  const activeItems = useMemo(() => {
    if (!activeCollectionId) return [];
    
    let result = items.filter(i => (i.collection_id || 'outros') === activeCollectionId);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(term));
    }

    return result;
  }, [items, activeCollectionId, searchTerm]);

  // --- Handlers de Seleção ---

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
    const allIds = new Set(activeItems.map(i => i.id));
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // --- Navegação ---

  const enterCollection = (colId: string) => {
    setActiveCollectionId(colId);
    setViewMode('items');
    setSearchTerm('');
  };

  const backToCollections = () => {
    setViewMode('collections');
    setActiveCollectionId(null);
    setSearchTerm('');
    handleClearSelection();
  };

  // --- Ações ---

  const handleCardClick = (item: DiscoveredItem) => {
    // Se estiver em modo de seleção, o clique alterna a seleção
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

    // Caso contrário, abre a customização
    const hasLayers = item.layers && item.layers.length > 0 && item.layers.some(l => l.type !== 'fixed');
    if (hasLayers) {
      onCustomizeCompositeItem(item);
    } else {
      onSelectSimpleItem(item);
    }
  };

  const handleBulkConfirm = (results: any[]) => {
    if (onAddBulkItems) onAddBulkItems(results);
    handleClearSelection();
    setIsBulkModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando catálogo...</p>
      </div>
    );
  }

  const selectedItemsList = items.filter(i => selectedIds.has(i.id));

  return (
    <div className={styles.container}>
      
      {/* --- View: Lista de Coleções --- */}
      {viewMode === 'collections' && (
        <div className={styles.collectionsView}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>
               <FiGrid size={32} />
            </div>
            <h2 className={styles.title}>Minhas Coleções</h2>
            <p className={styles.subtitle}>Explore o catálogo por categorias</p>
          </div>

          <div className={styles.collectionsGrid}>
            {collections.map(col => (
              <div key={col.id} className={styles.collectionCard} onClick={() => enterCollection(col.id)}>
                <div className={styles.collectionPreview}>
                  {col.preview ? (
                    <img src={col.preview} alt={col.name} loading="lazy" />
                  ) : (
                    <div className={styles.noPreviewIcon}>
                      <FiFolder size={48} />
                    </div>
                  )}
                  <div className={styles.overlayGradient} />
                </div>
                <div className={styles.collectionInfo}>
                  <h3 className={styles.collectionName}>{col.name}</h3>
                  <span className={styles.itemCountBadge}>{col.count} itens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- View: Itens da Coleção --- */}
      {viewMode === 'items' && (
        <div className={styles.itemsView}>
          <div className={styles.itemsHeader}>
            <div className={styles.headerLeft}>
              <button className={styles.backButton} onClick={backToCollections}>
                <FiArrowLeft size={20} />
              </button>
              <h2 className={styles.collectionTitle}>
                {formatCollectionName(activeCollectionId || '')}
              </h2>
            </div>
            
            <div className={styles.searchWrapper}>
              <SearchBar 
                placeholder="Buscar nesta coleção..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
              />
            </div>
          </div>

          {/* Barra de Seleção (Bulk Actions) */}
          {selectedIds.size > 0 && (
            <div className={styles.selectionToolbar}>
              <div className={styles.selectionInfo}>
                <div className={styles.countBadge}>{selectedIds.size}</div>
                <span className={styles.selectionText}>itens selecionados</span>
                <div className={styles.divider} />
                <button className={styles.linkBtn} onClick={handleSelectAll}>Selecionar Todos</button>
                <button className={styles.linkBtn} onClick={handleClearSelection}>Limpar</button>
              </div>
              <Button variant="primary" onClick={() => setIsBulkModalOpen(true)}>
                <FiLayers size={16} /> Personalizar Seleção
              </Button>
            </div>
          )}

          <div className={styles.itemsGridScroll}>
            {activeItems.length > 0 ? (
              <div className={styles.itemsGrid}>
                {activeItems.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`${styles.itemCardWrapper} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleCardClick(item)}
                    >
                      {/* Checkbox Overlay */}
                      <div 
                        className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}
                        onClick={(e) => toggleSelection(e, item.id)}
                        title={isSelected ? "Desmarcar" : "Selecionar"}
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
            ) : (
              <div className={styles.emptyState}>
                <FiSearch size={48} className={styles.emptyIcon} />
                <p>Nenhum item encontrado nesta coleção.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <BulkCustomizerModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        items={selectedItemsList}
        onConfirm={handleBulkConfirm}
      />
    </div>
  );
}

// Helper de Formatação
function formatCollectionName(rawName: string): string {
  if (!rawName) return 'Geral';
  if (rawName === 'outros') return 'Outros';

  let cleaned = rawName.replace(/^colecao[-_]/i, '');
  cleaned = cleaned.replace(/[-_]/g, ' ');
  cleaned = cleaned.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return `Coleção ${cleaned}`;
}