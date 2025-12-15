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
  collectionName?: string;
  consultantName?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  createdAtFormatted?: string;
  deliveryDateFormatted?: string;
  // Novo campo para descrição textual
  customizationDescription?: string[]; 
}

export function useProjects(consultantId?: string) {
  const [allProjects, setAllProjects] = useState<ProjectWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadProjects();
  }, [consultantId]);

  // Função auxiliar para formatar nome da coleção
  const formatCollectionName = (slug: string) => {
    if (!slug) return 'Coleção Geral';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Função auxiliar para gerar descrição legível das personalizações
  const generateCustomizationDescription = (data: any): string[] => {
    if (!data || !data.cart_items || data.cart_items.length === 0) {
      return ['Nenhum item personalizado neste projeto.'];
    }

    return data.cart_items.map((cartItem: any) => {
      const itemName = cartItem.item?.name || 'Item desconhecido';
      
      if (!cartItem.customizations || cartItem.customizations.length === 0) {
        return `• ${itemName}: Padrão da coleção (sem alterações).`;
      }

      const changes = cartItem.customizations.map((c: any) => 
        `Camada ${c.layer_index} com ${c.pattern_name}`
      ).join(', ');

      return `• ${itemName}: ${changes}.`;
    });
  };

  const loadProjects = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('projects')
        .select(`
          *,
          consultant:users!projects_consultant_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (consultantId) {
        query = query.eq('consultant_id', consultantId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = (data || []).map((p: any) => ({
        ...p,
        clientName: p.client_name, 
        consultantName: p.consultant?.name || 'Desconhecido',
        collectionName: formatCollectionName(p.collection_id),
        createdAtFormatted: new Date(p.created_at).toLocaleDateString('pt-BR'),
        customizationDescription: generateCustomizationDescription(p.customizations_data)
      }));

      setAllProjects(formattedData);
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
    
    const matchesStatus = !statusFilter || statusFilter === 'todos' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getProjectById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          consultant:users!projects_consultant_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        clientName: data.client_name,
        clientPhone: data.client_phone,
        clientEmail: data.client_email,
        consultantName: data.consultant?.name || 'Desconhecido',
        collectionName: formatCollectionName(data.collection_id),
        productionNotes: data.production_notes,
        createdAtFormatted: new Date(data.created_at).toLocaleDateString('pt-BR'),
        deliveryDateFormatted: data.delivery_date ? new Date(data.delivery_date).toLocaleDateString('pt-BR') : null,
        // Aqui geramos a descrição textual real baseada no JSON
        customizationDescription: generateCustomizationDescription(data.customizations_data)
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  };

  const createProject = async (projectData: any) => {
    try {
      const { project } = projectData;
      const payload = {
        ...project,
        collection_id: String(project.collection_id || 'geral')
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      await loadProjects();
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: any) => {
    try {
        const { error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
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
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
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