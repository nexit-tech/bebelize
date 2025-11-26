import { useState, useEffect } from 'react';
import { discoveryService } from '@/lib/discovery/discoveryService';
import type { DiscoveredCollection } from '@/lib/discovery/types';

export const useCollections = () => {
  const [collections, setCollections] = useState<DiscoveredCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await discoveryService.getCollections();
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar coleções');
      console.error('Error loading collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCollectionById = async (id: string): Promise<DiscoveredCollection | null> => {
    const cached = collections.find(c => c.id === id || c.slug === id);
    if (cached) return cached;
    
    try {
      return await discoveryService.getCollectionById(id);
    } catch (err) {
      console.error('Error fetching collection:', err);
      return null;
    }
  };

  const refresh = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (forceRefresh) {
        await discoveryService.refreshCache();
      }
      
      const data = await discoveryService.getCollections(forceRefresh);
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar coleções');
      console.error('Error refreshing collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    collections,
    isLoading,
    error,
    getCollectionById,
    refresh
  };
};