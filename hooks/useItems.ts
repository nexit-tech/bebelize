import { useState, useEffect } from 'react';
import { discoveryService } from '@/lib/discovery/discoveryService';
import type { DiscoveredItem } from '@/lib/discovery/types';

export const useItems = (collectionId?: string) => {
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) {
      loadItems(collectionId);
    } else {
      loadAllItems();
    }
  }, [collectionId]);

  const loadItems = async (colId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await discoveryService.getItemsByCollection(colId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar items');
      console.error('Error loading items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const collections = await discoveryService.getCollections();
      const allItems = collections.flatMap(c => c.items);
      setItems(allItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar items');
      console.error('Error loading all items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemById = async (id: string): Promise<DiscoveredItem | null> => {
    const cached = items.find(i => i.id === id);
    if (cached) return cached;

    try {
      return await discoveryService.getItemById(id);
    } catch (err) {
      console.error('Error fetching item:', err);
      return null;
    }
  };

  const searchItems = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await discoveryService.searchItems(query);
      setItems(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca');
      console.error('Error searching items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    if (collectionId) {
      await loadItems(collectionId);
    } else {
      await loadAllItems();
    }
  };

  const getSimpleItems = () => {
    return items.filter(item => item.item_type === 'simple');
  };

  const getCompositeItems = () => {
    return items.filter(item => item.item_type === 'composite');
  };

  return {
    items,
    isLoading,
    error,
    getItemById,
    searchItems,
    refresh,
    getSimpleItems,
    getCompositeItems
  };
};