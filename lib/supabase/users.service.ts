import { supabase } from './client';
import { User, UserCreateInput, UserRole } from '@/types';

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.created_at,
      active: user.active
    }));
  },

  async getByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.created_at,
      active: user.active
    }));
  },

  async create(input: UserCreateInput): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      createdAt: data.created_at,
      active: data.active
    };
  },

  async update(id: string, updates: Partial<User>): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        role: updates.role
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    return true;
  },

  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  }
};