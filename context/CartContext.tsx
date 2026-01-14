'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cartService } from '@/lib/supabase/cart.service';
import { CustomizedItem } from '@/types/customizedItem.types';

interface CartContextType {
  cartItems: CustomizedItem[];
  updateCartItems: (items: CustomizedItem[]) => Promise<void>;
  isLoadingCart: boolean;
  isSavingCart: boolean;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addItem: (item: CustomizedItem) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CustomizedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClientComponentClient();

  const loadCart = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const cartData = await cartService.getCart();
        if (cartData && cartData.items) {
          setItems(cartData.items as CustomizedItem[]);
        }
      } else {
        setItems([]); 
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateCartItems = async (newItems: CustomizedItem[]) => {
    setItems(newItems);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsSaving(true);
        await cartService.saveCart(newItems);
      }
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = async (newItem: CustomizedItem) => {
    const newCartList = [...items, newItem];
    await updateCartItems(newCartList);
  };

  const clearCart = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await cartService.clearCart();
      }
      setItems([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems: items, 
      updateCartItems, 
      addItem, 
      isLoadingCart: isLoading, 
      isSavingCart: isSaving, 
      clearCart, 
      refreshCart: loadCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext deve ser usado dentro de um CartProvider');
  }
  return context;
}