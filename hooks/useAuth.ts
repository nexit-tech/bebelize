import { useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/supabase';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const user = await authService.getUserById(userId);
        setCurrentUser(user);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const user = await authService.login(email, password);
    
    if (user) {
      localStorage.setItem('userId', user.id);
      setCurrentUser(user);
      return user;
    }
    
    return null;
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