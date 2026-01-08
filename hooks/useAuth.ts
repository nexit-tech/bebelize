import { useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/supabase';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Verifica se está no navegador antes de acessar localStorage
        if (typeof window !== 'undefined') {
          const userId = localStorage.getItem('userId');
          
          if (userId) {
            const user = await authService.getUserById(userId);
            if (user) {
              // Forçamos o tipo aqui para garantir compatibilidade entre DB e Interface
              setCurrentUser(user as unknown as User);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      const user = await authService.login(email, password);
      
      if (user) {
        localStorage.setItem('userId', user.id);
        const appUser = user as unknown as User;
        setCurrentUser(appUser);
        return appUser;
      }
      
      return null;
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setCurrentUser(null);
  };

  return {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser
  };
};