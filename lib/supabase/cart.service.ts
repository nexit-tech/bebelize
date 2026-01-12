import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const cartService = {
  async getCart() {
    const { data: { session } } = await supabase.auth.getSession();
    
    let user: User | null = session?.user ?? null;

    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    }
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(error);
    }

    return data;
  },

  async saveCart(items: any[]) {
    const { data: { session } } = await supabase.auth.getSession();
    
    let user: User | null = session?.user ?? null;

    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    }
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('carts')
      .upsert({
        user_id: user.id,
        items: items, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    
    return data;
  },

  async clearCart() {
    const { data: { session } } = await supabase.auth.getSession();
    
    let user: User | null = session?.user ?? null;

    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    }
    
    if (!user) return;

    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};