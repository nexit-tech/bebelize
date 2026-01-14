// lib/supabase/cart.service.ts
import { supabase } from '@/lib/supabase/client';
import { CustomizedItem } from '@/types/customizedItem.types';

export const cartService = {
  
  async getCart() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { items: [] };

    const { data, error } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { 
      console.error('Erro ao buscar carrinho:', error);
      return { items: [] };
    }

    return { items: (data?.items as CustomizedItem[]) || [] };
  },

  async saveCart(items: CustomizedItem[]) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado. Faça login para salvar.');
    }

    const { error } = await supabase
      .from('carts')
      .upsert(
        { 
          user_id: session.user.id, 
          items: items, 
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
  },

  async clearCart() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('carts')
      .update({ items: [] })
      .eq('user_id', session.user.id);
  }
};