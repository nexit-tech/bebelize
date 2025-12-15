import { supabase } from './client';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

interface ProjectWithDetails extends Project {
  consultant?: {
    id: string;
    name: string;
    email: string;
  };
  collection?: {
    id: string;
    name: string;
    theme: string | null;
  };
  // Mantemos compatibilidade com projetos antigos se necessário
  customization?: {
    fabric_details: string | null;
    main_color: string | null;
    secondary_colors: string[] | null;
    embroidery_details: string | null;
    observations: string | null;
  };
}

export const projectsService = {
  async getAll(): Promise<ProjectWithDetails[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        consultant:users!projects_consultant_id_fkey(id, name, email),
        collection:collections(id, name, theme),
        customization:project_customizations(
          fabric_details,
          main_color,
          secondary_colors,
          embroidery_details,
          observations
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<ProjectWithDetails | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        consultant:users!projects_consultant_id_fkey(id, name, email),
        collection:collections(id, name, theme),
        customization:project_customizations(
          fabric_details,
          main_color,
          secondary_colors,
          embroidery_details,
          observations
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data;
  },

  async create(projectData: ProjectInsert): Promise<Project | null> {
    // Insere o projeto com todos os dados (incluindo JSON de itens em customizations_data)
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: ProjectUpdate): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    return true;
  }
};