'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiFilter, FiFolder, FiSearch, FiRotateCcw } from 'react-icons/fi';
import { useAuth, useProjects } from '@/hooks';
import { useCart } from '@/hooks/useCart';
import { getStatusLabel } from '@/utils';
import { ProjectStatus } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import SearchBar from '@/components/SearchBar/SearchBar';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import styles from './dashboard.module.css';

export default function DashboardConsultoraPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { cartItems } = useCart();
  
  const {
    projects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isLoading,
    deleteProject
  } = useProjects(currentUser?.id);

  // Estados para controle do Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const hasDraft = cartItems.length > 0;

  const handleCreateProject = () => {
    router.push('/projeto/criar');
  };

  const handleProjectClick = (id: string) => {
    router.push(`/projeto/${id}`);
  };

  // Abre o modal solicitando confirmação
  const handleRequestDelete = (id: string) => {
    setProjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Executa a exclusão após confirmação no modal
  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      const success = await deleteProject(projectToDelete);
      
      if (!success) {
        alert('Erro ao excluir o projeto. Tente novamente.');
      }
      
      // Limpa o estado e fecha o modal
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Consultora';
  const currentDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerWelcome}>
            <h1 className={styles.title}>
              Olá, <span className={styles.userName}>{firstName}</span>
            </h1>
            <p className={styles.date}>{currentDate}</p>
          </div>
          
          <div className={styles.headerActions}>
            <Button 
              variant={hasDraft ? "secondary" : "primary"}
              size="large" 
              onClick={handleCreateProject}
            >
              {hasDraft ? (
                <>
                  <FiRotateCcw size={20} /> Continuar Rascunho
                </>
              ) : (
                <>
                  <FiPlus size={20} /> Novo Projeto
                </>
              )}
            </Button>
            
            {hasDraft && (
              <div className={styles.draftBadge}>
                {cartItems.length} itens salvos
              </div>
            )}
          </div>
        </header>

        <div className={styles.toolbarWrapper}>
          <div className={styles.toolbar}>
            <div className={styles.searchContainer}>
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar projeto ou cliente..."
              />
            </div>

            <div className={styles.filterContainer}>
              <div className={styles.selectWrapper}>
                <FiFilter className={styles.filterIcon} size={18} />
                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
          </div>
        </div>

        <div className={styles.contentArea}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Carregando seus projetos...</p>
            </div>
          ) : (
            <>
              {projects.length > 0 ? (
                <div className={styles.projectsGrid}>
                  {projects.map((project) => (
                    <div key={project.id} className={styles.gridItem}>
                      <ProjectCard
                        name={project.name}
                        clientName={project.client_name}
                        createdAt={project.created_at}
                        status={project.status as ProjectStatus}
                        statusLabel={getStatusLabel(project.status as ProjectStatus)}
                        onClick={() => handleProjectClick(project.id)}
                        onDelete={() => handleRequestDelete(project.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconCircle}>
                    {searchQuery ? <FiSearch size={40} /> : <FiFolder size={48} />}
                  </div>
                  <h3 className={styles.emptyTitle}>
                    {searchQuery ? 'Nenhum projeto encontrado' : 'Vamos começar?'}
                  </h3>
                  <p className={styles.emptyText}>
                    {searchQuery 
                      ? 'Não encontramos nenhum projeto com esse nome. Tente outra busca.' 
                      : 'Você ainda não tem projetos ativos. Crie sua primeira ordem de produção agora mesmo.'}
                  </p>
                  {!searchQuery && (
                    <Button variant="primary" onClick={handleCreateProject}>
                      <FiPlus size={18} /> Criar Primeiro Projeto
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          title="Excluir Projeto"
          message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita e todos os dados serão perdidos."
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      </main>
    </div>
  );
}