'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks';
import Sidebar from '@/components/Sidebar/Sidebar';
import ProductionCard from '@/components/ProductionCard/ProductionCard';
import ProductionHeader from '@/components/ProductionHeader/ProductionHeader';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import FilterBar from '@/components/FilterBar/FilterBar';
import styles from './atelier.module.css';

export default function DashboardAtelier() {
  const router = useRouter();
  
  // Atelier chama sem ID para pegar projetos de TODAS as consultoras
  const { allProjects, isLoading } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false });

  // Atelier vê tudo MENOS rascunhos e cancelados
  const relevantProjects = allProjects.filter(p => 
    p.status !== 'rascunho' && p.status !== 'cancelado'
  );

  const urgentProjects = relevantProjects.filter(p => p.priority === 'urgente').length;

  const filteredProjects = relevantProjects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    const matchesPriority = filterPriority === 'todos' || p.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewDetails = (projectId: string) => {
    router.push(`/atelier/projeto/${projectId}`);
  };

  // Simples navegação para detalhes, onde a mudança de status real ocorre
  const handleEditStatus = (projectId: string) => {
    router.push(`/atelier/projeto/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <p>Carregando fila de produção...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Fila de Produção</h1>
            <p className={styles.subtitle}>Visão prática das tarefas em andamento</p>
          </div>
        </header>

        <ProductionHeader 
          totalProjects={relevantProjects.length}
          urgentProjects={urgentProjects}
        />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
        />

        <div className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <ProductionCard
              key={project.id}
              id={project.id}
              projectName={project.name}
              clientName={project.client_name}
              createdAt={project.created_at}
              priority={project.priority as 'normal' | 'urgente'}
              onViewDetails={() => handleViewDetails(project.id)}
              onMarkAsComplete={() => handleEditStatus(project.id)}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Fila vazia</p>
            <p className={styles.emptySubtext}>Nenhum projeto requer atenção</p>
          </div>
        )}
      </main>
      
      {/* Modais omitidos para brevidade, mantendo lógica visual */}
    </div>
  );
}