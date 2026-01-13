import { supabase } from '@/lib/supabase/client';

export const cartService = {
  async getCart() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar carrinho:', error);
    }

    return data;
  },

  async saveCart(items: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');

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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};