import { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '@/types';
import { projectsData } from '@/data';

export const useProjects = (consultantId?: string) => {
  const [projects, setProjects] = useState<Project[]>(projectsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'todos'>('todos');

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (consultantId) {
      filtered = filtered.filter(p => p.consultantId === consultantId);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.clientName.toLowerCase().includes(query) ||
          p.collectionName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [projects, consultantId, searchQuery, statusFilter]);

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const createProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  return {
    projects: filteredProjects,
    allProjects: projects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    getProjectById,
    updateProject,
    deleteProject,
    createProject
  };
};