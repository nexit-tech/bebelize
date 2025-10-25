'use client';

import { useState } from 'react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import SearchBar from '@/components/SearchBar/SearchBar';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './dashboard.module.css';

export default function DashboardConsultora() {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Estados dos Modais
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Dados Mockados
  const mockProjects = [
    {
      id: '1',
      name: 'Enxoval - Maria Alice',
      clientName: 'Ana Paula Silva',
      createdAt: '15/10/2024',
      status: 'negociacao' as const,
      statusLabel: 'Em Negociação'
    },
    {
      id: '2',
      name: 'Kit Berço - Pedro Henrique',
      clientName: 'Carla Mendes',
      createdAt: '12/10/2024',
      status: 'aprovado' as const,
      statusLabel: 'Aprovado'
    },
    {
      id: '3',
      name: 'Enxoval Completo - Sofia',
      clientName: 'Juliana Costa',
      createdAt: '08/10/2024',
      status: 'producao' as const,
      statusLabel: 'Em Produção'
    },
    {
      id: '4',
      name: 'Kit Maternidade - Lucas',
      clientName: 'Beatriz Santos',
      createdAt: '05/10/2024',
      status: 'finalizado' as const,
      statusLabel: 'Finalizado'
    },
    {
      id: '5',
      name: 'Enxoval Premium - Isabella',
      clientName: 'Fernanda Oliveira',
      createdAt: '20/09/2024',
      status: 'negociacao' as const,
      statusLabel: 'Em Negociação'
    },
    {
      id: '6',
      name: 'Kit Berço Anjos - Miguel',
      clientName: 'Patricia Lima',
      createdAt: '18/09/2024',
      status: 'aprovado' as const,
      statusLabel: 'Aprovado'
    }
  ];

  // Handlers
  const handleCreateProject = () => {
    console.log('Criar novo projeto');
  };

  const handleProjectClick = (id: string) => {
    console.log('Abrir projeto:', id);
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
          {mockProjects.map((project) => (
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
        {mockProjects.length === 0 && (
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