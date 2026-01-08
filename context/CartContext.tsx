'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '@/lib/supabase/cart.service';
import { CartItem } from '@/components/ProjetoCarrinhoDiscovery/ProjetoCarrinhoDiscovery';

interface CartContextType {
  cartItems: CartItem[];
  updateCartItems: (items: CartItem[]) => void;
  isLoadingCart: boolean;
  isSavingCart: boolean;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carrega o carrinho inicial
  const loadCart = useCallback(async () => {
    try {
      // setIsLoading(true); // Opcional: Evita flash se não quiser loading em todo refresh
      const cartData = await cartService.getCart();
      if (cartData && cartData.items) {
        const parsedItems = Array.isArray(cartData.items) ? cartData.items : [];
        setItems(parsedItems as CartItem[]);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateCartItems = async (newItems: CartItem[]) => {
    // 1. Atualiza visualmente na hora (Optimistic UI)
    setItems(newItems);
    
    // 2. Salva no banco em segundo plano
    try {
      setIsSaving(true);
      await cartService.saveCart(newItems);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setItems([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems: items, 
      updateCartItems, 
      isLoadingCart: isLoading, 
      isSavingCart: isSaving,
      clearCart,
      refreshCart: loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook interno para acessar o contexto (usado pelo hook público)
export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}