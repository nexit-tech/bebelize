import { useState, useEffect } from 'react';
import { Collection, CollectionCreateInput } from '@/types';
import { collectionsService } from '@/lib/supabase';

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    const data = await collectionsService.getAll();
    setCollections(data);
    setIsLoading(false);
  };

  const getCollectionById = async (id: string): Promise<Collection | null> => {
    const cached = collections.find(c => c.id === id);
    if (cached) return cached;
    
    return await collectionsService.getById(id);
  };

  const createCollection = async (input: CollectionCreateInput): Promise<Collection | null> => {
    const newCollection = await collectionsService.create(input);
    
    if (newCollection) {
      setCollections(prev => [...prev, newCollection]);
    }
    
    return newCollection;
  };

  const updateCollection = async (id: string, updates: Partial<Collection>): Promise<boolean> => {
    const success = await collectionsService.update(id, updates);
    
    if (success) {
      setCollections(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      );
    }
    
    return success;
  };

  const deleteCollection = async (id: string): Promise<boolean> => {
    const success = await collectionsService.delete(id);
    
    if (success) {
      setCollections(prev => prev.filter(c => c.id !== id));
    }
    
    return success;
  };

  return {
    collections,
    isLoading,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    refresh: loadCollections
  };
};