import { useState, useEffect } from 'react';
import { User, UserCreateInput, UserRole } from '@/types';
import { usersService } from '@/lib/supabase';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await usersService.getAll();
    setUsers(data);
    setIsLoading(false);
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
  };

  const getUsersByRole = async (role: UserRole): Promise<User[]> => {
    return await usersService.getByRole(role);
  };

  const createUser = async (input: UserCreateInput): Promise<User | null> => {
    const newUser = await usersService.create(input);
    
    if (newUser) {
      setUsers(prev => [...prev, newUser]);
    }
    
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    const success = await usersService.update(id, updates);
    
    if (success) {
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, ...updates } : u))
      );
    }
    
    return success;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const success = await usersService.softDelete(id);
    
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
    
    return success;
  };

  return {
    users,
    allUsers: users,
    isLoading,
    getUserById,
    getUsersByRole,
    createUser,
    updateUser,
    deleteUser,
    activateUser: async () => true
  };
};