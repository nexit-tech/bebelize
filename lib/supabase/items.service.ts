import { supabase } from './client';
import type { Database } from '@/types/database.types';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

interface ItemWithCollection extends Item {
  collection?: {
    id: string;
    name: string;
    theme: string | null;
  };
}

export const itemsService = {
  async getAll(): Promise<ItemWithCollection[]> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        collection:collections(id, name, theme)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      throw error;
    }

    return data || [];
  },

  async getByCollectionId(collectionId: string): Promise<ItemWithCollection[]> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        collection:collections(id, name, theme)
      `)
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items by collection:', error);
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<ItemWithCollection | null> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        collection:collections(id, name, theme)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching item:', error);
      return null;
    }

    return data;
  },

  async create(item: ItemInsert): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: ItemUpdate): Promise<Item | null> {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }

    return true;
  }
};


