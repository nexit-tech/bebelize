'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiFilter } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import SearchBar from '@/components/SearchBar/SearchBar';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { mockProjects } from '@/mocks';
import styles from './dashboard.module.css';

export default function DashboardConsultora() {
  const router = useRouter();

  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Estados dos Modais
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Filtrar projetos da consultora (simulando usuário logado)
  const currentUserId = 'ana'; // Simulando usuário logado
  const userProjects = mockProjects.filter(p => p.consultantId === currentUserId);

  // Handlers
  const handleCreateProject = () => {
    router.push('/projeto/criar');
  };

  const handleProjectClick = (id: string) => {
    router.push(`/projeto/${id}`);
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Meus Projetos</h1>
              <p className={styles.subtitle}>Gerencie todos os seus enxovais personalizados</p>
            </div>
            <Button variant="primary" onClick={handleCreateProject}>
              <FiPlus size={20} />
              Criar Novo Projeto
            </Button>
          </div>

          {/* Barra de Ferramentas */}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filtrar por status"
              >
                <option value="todos">Todos os Status</option>
                <option value="negociacao">Em Negociação</option>
                <option value="aprovado">Aprovado</option>
                <option value="producao">Em Produção</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </header>

        {/* Grid de Projetos */}
        <div className={styles.projectsGrid}>
          {userProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              clientName={project.clientName}
              createdAt={project.createdAt}
              status={project.status}
              statusLabel={project.statusLabel}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {userProjects.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum projeto encontrado</p>
            <p className={styles.emptySubtext}>Crie seu primeiro projeto para começar</p>
          </div>
        )}

      </main>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

    </div>
  );
}