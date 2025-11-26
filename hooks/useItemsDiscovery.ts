import { useState, useEffect } from 'react';
import { itemCache } from '@/lib/discovery/itemCache';
import type { DiscoveredItem, ScanResult } from '@/lib/discovery/types';

export function useItemsDiscovery() {
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cached = itemCache.load();
      
      if (cached && cached.success) {
        const allItems = cached.collections.flatMap(col => col.items);
        setItems(allItems);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/items/discover');
      
      if (!response.ok) {
        throw new Error('Failed to discover items');
      }

      const data: ScanResult = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Discovery failed');
      }

      itemCache.save(data);

      const allItems = data.collections.flatMap(col => col.items);
      setItems(allItems);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemById = (itemId: string): DiscoveredItem | null => {
    return items.find(item => item.id === itemId) || null;
  };

  const getItemsByCollection = (collectionSlug: string): DiscoveredItem[] => {
    return items.filter(item => item.collection_slug === collectionSlug);
  };

  const refreshCache = async () => {
    itemCache.clear();
    await loadItems();
  };

  return {
    items,
    isLoading,
    error,
    getItemById,
    getItemsByCollection,
    refresh: refreshCache
  };
}