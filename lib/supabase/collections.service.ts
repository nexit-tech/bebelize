import { supabase } from './client';
import type { Database } from '@/types/database.types';

type Collection = Database['public']['Tables']['collections']['Row'];
type CollectionInsert = Database['public']['Tables']['collections']['Insert'];
type CollectionUpdate = Database['public']['Tables']['collections']['Update'];

interface CollectionWithItemCount extends Collection {
  item_count: number;
}

export const collectionsService = {
  async getAll(): Promise<CollectionWithItemCount[]> {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        items(count)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }

    return (data || []).map((collection: Collection & { items: { count: number }[] }) => ({
      ...collection,
      item_count: collection.items?.[0]?.count || 0
    }));
  },

  async getById(id: string): Promise<CollectionWithItemCount | null> {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        items(count)
      `)
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Error fetching collection:', error);
      return null;
    }

    if (!data) return null;

    const collection = data as Collection & { items: { count: number }[] };

    return {
      ...collection,
      item_count: collection.items?.[0]?.count || 0
    };
  },

  async create(collection: CollectionInsert): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: CollectionUpdate): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating collection:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('collections')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }

    return true;
  }
};


