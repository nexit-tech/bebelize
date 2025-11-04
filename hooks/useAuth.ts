import { useState, useEffect } from 'react';
import { User } from '@/types';
import { usersData } from '@/data';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const user = usersData.find(u => u.id === userId);
      setCurrentUser(user || null);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): User | null => {
    const user = usersData.find(
      u => u.email === email && u.password === password && u.active
    );
    
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