import { useState, useEffect } from 'react';
import { discoveryService } from '@/lib/discovery/discoveryService';
import type { DiscoveredItem, DiscoveredCollection } from '@/lib/discovery/types';

export function useItemsDiscovery() {
  const [items, setItems] = useState<DiscoveredItem[]>([]);
  const [collections, setCollections] = useState<DiscoveredCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cachedData = discoveryService.getCachedData();
      
      if (cachedData && cachedData.success) {
        setCollections(cachedData.collections);
        const allItems = cachedData.collections.flatMap(col => col.items);
        setItems(allItems);
        setIsLoading(false);
        return;
      }

      const freshCollections = await discoveryService.getCollections(true);
      setCollections(freshCollections);
      const allItems = freshCollections.flatMap(col => col.items);
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

  const getCollectionById = (collectionId: string): DiscoveredCollection | null => {
    return collections.find(col => 
      col.id === collectionId || col.slug === collectionId
    ) || null;
  };

  const refreshCache = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await discoveryService.refreshCache();
      
      if (result.success) {
        setCollections(result.collections);
        const allItems = result.collections.flatMap(col => col.items);
        setItems(allItems);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refreshing cache');
      console.error('Error refreshing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    collections,
    isLoading,
    error,
    getItemById,
    getItemsByCollection,
    getCollectionById,
    refresh: refreshCache
  };
}