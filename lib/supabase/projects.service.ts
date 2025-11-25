import { supabase } from './client';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type ProjectCustomizationInsert = Database['public']['Tables']['project_customizations']['Insert'];
type ProjectCustomizationUpdate = Database['public']['Tables']['project_customizations']['Update'];

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
  customization?: {
    fabric_details: string | null;
    main_color: string | null;
    secondary_colors: string[] | null;
    embroidery_details: string | null;
    observations: string | null;
  };
}

interface CreateProjectInput {
  project: ProjectInsert;
  customization?: Omit<ProjectCustomizationInsert, 'project_id'>;
}

interface UpdateProjectInput {
  project?: ProjectUpdate;
  customization?: ProjectCustomizationUpdate;
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

  async getByConsultantId(consultantId: string): Promise<ProjectWithDetails[]> {
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
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects by consultant:', error);
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

  async create(input: CreateProjectInput): Promise<Project | null> {
    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(input.project)
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      throw projectError;
    }

    // Create customization if provided
    if (input.customization && project) {
      const { error: customizationError } = await supabase
        .from('project_customizations')
        .insert({
          project_id: project.id,
          ...input.customization
        });

      if (customizationError) {
        console.error('Error creating customization:', customizationError);
        // Rollback project creation
        await supabase.from('projects').delete().eq('id', project.id);
        throw customizationError;
      }
    }

    return project;
  },

  async update(id: string, updates: UpdateProjectInput): Promise<Project | null> {
    // Update project if provided
    if (updates.project) {
      const { error: projectError } = await supabase
        .from('projects')
        .update(updates.project)
        .eq('id', id);

      if (projectError) {
        console.error('Error updating project:', projectError);
        throw projectError;
      }
    }

    // Update customization if provided
    if (updates.customization) {
      const { error: customizationError } = await supabase
        .from('project_customizations')
        .update(updates.customization)
        .eq('project_id', id);

      if (customizationError) {
        console.error('Error updating customization:', customizationError);
        throw customizationError;
      }
    }

    // Return updated project
    const { data, error } = await supabase
      .from('projects')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching updated project:', error);
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


