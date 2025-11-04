import { useState } from 'react';
import { User, UserCreateInput, UserRole } from '@/types';
import { usersData } from '@/data';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(usersData);

  const getUserById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
  };

  const getUsersByRole = (role: UserRole): User[] => {
    return users.filter(u => u.role === role && u.active);
  };

  const createUser = (input: UserCreateInput): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      active: true
    };
    
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, active: false } : u))
    );
  };

  const activateUser = (id: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, active: true } : u))
    );
  };

  return {
    users: users.filter(u => u.active),
    allUsers: users,
    getUserById,
    getUsersByRole,
    createUser,
    updateUser,
    deleteUser,
    activateUser
  };
};