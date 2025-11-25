import { supabase } from './client';
import type { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];

export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('active', true)
        .single();

      if (error) {
        console.error('Login error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Login exception:', error);
      return null;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) {
        console.error('Get user error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get user exception:', error);
      return null;
    }
  }
};