'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';
import { useProjects } from '@/hooks';
import Sidebar from '@/components/Sidebar/Sidebar';
import SearchBar from '@/components/SearchBar/SearchBar';
import ProductionCard from '@/components/ProductionCard/ProductionCard';
import ProductionHeader from '@/components/ProductionHeader/ProductionHeader';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './atelier.module.css';

export default function DashboardAtelier() {
  const router = useRouter();
  const {
    allProjects,
    searchQuery,
    setSearchQuery,
    updateProject
  } = useProjects();

  const [filterPriority, setFilterPriority] = useState('todos');
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

  const productionProjects = allProjects.filter(p => 
    p.status === 'aprovado' || p.status === 'producao'
  );

  const urgentProjects = productionProjects.filter(p => p.priority === 'urgente');

  const filteredProjects = filterPriority === 'urgente' 
    ? urgentProjects 
    : filterPriority === 'normal'
    ? productionProjects.filter(p => p.priority === 'normal')
    : productionProjects;

  const searchFiltered = filteredProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (projectId: string) => {
    router.push(`/atelier/projeto/${projectId}`);
  };

  const handleMarkAsComplete = (projectId: string, projectName: string) => {
    setConfirmModal({
      isOpen: true,
      projectId,
      projectName
    });
  };

  const confirmComplete = () => {
    updateProject(confirmModal.projectId, { status: 'finalizado' });
    setConfirmModal({ isOpen: false, projectId: '', projectName: '' });
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Finalizado!',
      message: 'O projeto foi marcado como concluído e está pronto para entrega.'
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Fila de Produção</h1>
            <p className={styles.subtitle}>Projetos aguardando fabricação</p>
          </div>
        </header>

        <ProductionHeader 
          totalProjects={productionProjects.length}
          urgentProjects={urgentProjects.length}
        />

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
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="todos">Todas as Prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        <div className={styles.projectsGrid}>
          {searchFiltered.map((project) => (
            <ProductionCard
              key={project.id}
              id={project.id}
              projectName={project.name}
              clientName={project.clientName}
              createdAt={project.createdAt}
              priority={project.priority}
              onViewDetails={() => handleViewDetails(project.id)}
              onMarkAsComplete={() => handleMarkAsComplete(project.id, project.name)}
            />
          ))}
        </div>

        {searchFiltered.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum projeto em produção</p>
            <p className={styles.emptySubtext}>Todos os projetos estão finalizados</p>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, projectId: '', projectName: '' })}
        onConfirm={confirmComplete}
        title="Finalizar Projeto"
        message={`Confirma que o projeto "${confirmModal.projectName}" foi produzido e está pronto para entrega?`}
        type="success"
        confirmText="Sim, Finalizar"
        cancelText="Cancelar"
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