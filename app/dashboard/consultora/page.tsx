'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { useAuth, useProjects } from '@/hooks';
import { getStatusLabel } from '@/utils';
import { ProjectStatus } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import SearchBar from '@/components/SearchBar/SearchBar';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import Button from '@/components/Button/Button';
import styles from './dashboard.module.css';

export default function DashboardConsultora() {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  // Passamos o ID do usuário para filtrar apenas os projetos dele
  const {
    projects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isLoading
  } = useProjects(currentUser?.id);

  const handleCreateProject = () => {
    router.push('/projeto/criar');
  };

  const handleProjectClick = (id: string) => {
    router.push(`/projeto/${id}`);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Meus Projetos</h1>
              <p className={styles.subtitle}>
                Gerencie todos os seus enxovais personalizados
              </p>
            </div>
            <Button variant="primary" onClick={handleCreateProject}>
              <FiPlus size={20} />
              Criar Novo Projeto
            </Button>
          </div>

          <div className={styles.toolbar}>
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por nome do projeto ou cliente..."
            />

            <div className={styles.filterContainer}>
              <FiFilter size={18} className={styles.filterIcon} />
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="rascunho">Rascunho</option>
                <option value="negociacao">Em Negociação</option>
                <option value="aprovado">Aprovado</option>
                <option value="producao">Em Produção</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </header>

        {isLoading ? (
           <p>Carregando projetos...</p>
        ) : (
          <>
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  clientName={project.client_name}
                  createdAt={project.created_at}
                  status={project.status as ProjectStatus}
                  statusLabel={getStatusLabel(project.status as ProjectStatus)}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>

            {projects.length === 0 && (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Nenhum projeto encontrado</p>
                <p className={styles.emptySubtext}>
                  Crie seu primeiro projeto para começar
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}