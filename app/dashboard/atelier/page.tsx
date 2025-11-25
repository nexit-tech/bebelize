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
  const { allProjects, updateProject, isLoading } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    projectId: '',
    projectName: ''
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const relevantProjects = allProjects.filter(p => 
    p.status !== 'cancelado' && p.status !== 'rascunho'
  );

  const urgentProjects = relevantProjects.filter(p => p.priority === 'urgente').length;

  const filteredProjects = relevantProjects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    const matchesPriority = filterPriority === 'todos' || p.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewDetails = (projectId: string) => {
    router.push(`/atelier/projeto/${projectId}`);
  };

  const handleEditStatus = (projectId: string) => {
    router.push(`/atelier/projeto/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <p>Carregando...</p>
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
            <p className={styles.subtitle}>Visão prática das tarefas em andamento, aprovadas e pendentes</p>
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
              clientName={project.clientName}
              createdAt={project.createdAt}
              priority={project.priority}
              onViewDetails={() => handleViewDetails(project.id)}
              onMarkAsComplete={() => handleEditStatus(project.id)}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Fila de Produção vazia</p>
            <p className={styles.emptySubtext}>Nenhum projeto requer sua atenção no momento</p>
          </div>
        )}
      </main>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, projectId: '', projectName: '' })}
        onConfirm={() => console.log('Confirmado')}
        title="Atualização de Status"
        message="Use a página de detalhes do projeto para marcar como concluído."
        type="info"
        confirmText="Entendi"
        cancelText="Fechar"
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}