import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Item {
  id: string;
  collection_id: string;
  name: string;
  description: string | null;
  code: string;
  final_image_url: string | null;
  layers_metadata: any;
  created_at: string;
  updated_at: string;
}

export function useItems(collectionId?: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [collectionId]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemById = async (id: string) => {
    const cached = items.find(item => item.id === id);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => [...prev, data]);
      }
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      return null;
    }
  };

  const createItem = async (item: Partial<Item>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => [...prev, data]);
      }
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev =>
          prev.map(item => (item.id === id ? data : item))
        );
      }
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  return {
    items,
    isLoading,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    refresh: loadItems
  };
}