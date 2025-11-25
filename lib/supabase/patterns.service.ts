import { supabase } from './client';
import type { Pattern } from '@/types/rendering.types';

export const patternsService = {
  async getAll(): Promise<Pattern[]> {
    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching patterns:', error);
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<Pattern | null> {
    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Error fetching pattern:', error);
      return null;
    }

    return data;
  },

  async getByCategory(category: string): Promise<Pattern[]> {
    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('category', category)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching patterns by category:', error);
      throw error;
    }

    return data || [];
  },

  async searchByTag(tag: string): Promise<Pattern[]> {
    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .contains('tags', [tag])
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching patterns by tag:', error);
      throw error;
    }

    return data || [];
  }
};