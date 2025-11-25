import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  consultant_id: string;
  collection_id: string;
  status: string;
  priority: string;
  delivery_date: string | null;
  production_notes: string | null;
  preview_image_url: string | null;
  technical_plant_url: string | null;
  customizations_data: any;
  created_at: string;
  updated_at: string;
}

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
}

export function useProjects(consultantId?: string) {
  const [allProjects, setAllProjects] = useState<ProjectWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, [consultantId]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('projects')
        .select(`
          *,
          consultant:users!projects_consultant_id_fkey(id, name, email),
          collection:collections(id, name, theme)
        `)
        .order('created_at', { ascending: false });

      if (consultantId) {
        query = query.eq('consultant_id', consultantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading projects:', error);
        throw error;
      }

      setAllProjects(data || []);
    } catch (error) {
      console.error('Error in loadProjects:', error);
      setAllProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const projects = allProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getProjectById = async (id: string) => {
    const cached = allProjects.find(p => p.id === id);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          consultant:users!projects_consultant_id_fkey(id, name, email),
          collection:collections(id, name, theme)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setAllProjects(prev => [...prev, data]);
      }

      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  };

  const createProject = async (projectData: any) => {
    try {
      const { project, customization } = projectData;

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (projectError) throw projectError;

      if (customization && newProject) {
        const { error: customizationError } = await supabase
          .from('project_customizations')
          .insert({
            project_id: newProject.id,
            ...customization
          });

        if (customizationError) {
          await supabase.from('projects').delete().eq('id', newProject.id);
          throw customizationError;
        }
      }

      await loadProjects();
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: any) => {
    try {
      const { project, customization } = updates;

      if (project) {
        const { error: projectError } = await supabase
          .from('projects')
          .update(project)
          .eq('id', id);

        if (projectError) throw projectError;
      }

      if (customization) {
        const { error: customizationError } = await supabase
          .from('project_customizations')
          .update(customization)
          .eq('project_id', id);

        if (customizationError) throw customizationError;
      }

      await loadProjects();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAllProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return {
    projects,
    allProjects,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    refresh: loadProjects
  };
}