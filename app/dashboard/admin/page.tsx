'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiDownload } from 'react-icons/fi';
import { useProjects, useUsers } from '@/hooks';
import { getStatusLabel } from '@/utils';
import { ProjectStatus } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import AdminStats from '@/components/AdminStats/AdminStats';
import FilterBar from '@/components/FilterBar/FilterBar';
import AdminProjectCard from '@/components/AdminProjectCard/AdminProjectCard';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './admin.module.css';

export default function DashboardAdmin() {
  const router = useRouter();
  const { allProjects, searchQuery, setSearchQuery, deleteProject } = useProjects();
  const { users } = useUsers();

  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterConsultant, setFilterConsultant] = useState('todos');
  const [filterPriority, setFilterPriority] = useState('todos'); // NOVO: Estado para prioridade
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

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.consultantName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'todos' || project.status === filterStatus;
    const matchesConsultant = filterConsultant === 'todos' || project.consultantId === filterConsultant;
    const matchesPriority = filterPriority === 'todos' || project.priority === filterPriority; // NOVO: Lógica de filtro

    return matchesSearch && matchesStatus && matchesConsultant && matchesPriority;
  });

  const stats = {
    total: allProjects.length,
    negociacao: allProjects.filter(p => p.status === 'negociacao').length,
    producao: allProjects.filter(p => p.status === 'producao').length,
    finalizado: allProjects.filter(p => p.status === 'finalizado').length,
    cancelado: allProjects.filter(p => p.status === 'cancelado').length
  };

  const handleExportReport = () => {
    setSuccessModal({
      isOpen: true,
      title: 'Relatório Exportado!',
      message: 'O relatório completo foi gerado e está pronto para download.'
    });
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projeto/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/projeto/editar/${projectId}`);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setConfirmModal({
      isOpen: true,
      projectId,
      projectName
    });
  };

  const confirmDelete = () => {
    deleteProject(confirmModal.projectId);
    setConfirmModal({ isOpen: false, projectId: '', projectName: '' });
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Excluído!',
      message: 'O projeto foi removido com sucesso do sistema.'
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Painel do Administrador</h1>
              <p className={styles.subtitle}>
                Visão completa de todos os projetos e consultoras
              </p>
            </div>
            <div className={styles.headerActions}>
              <Button variant="secondary" onClick={handleExportReport}>
                <FiDownload size={18} />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </header>

        <AdminStats
          totalProjects={stats.total}
          inNegotiation={stats.negociacao}
          inProduction={stats.producao}
          completed={stats.finalizado}
          cancelled={stats.cancelado}
        />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterConsultant={filterConsultant}
          onFilterConsultantChange={setFilterConsultant}
          filterPriority={filterPriority} 
          onFilterPriorityChange={setFilterPriority} 
          showConsultantFilter={true}
        />

        <div className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <AdminProjectCard
              key={project.id}
              id={project.id}
              projectName={project.name}
              clientName={project.clientName}
              consultantName={project.consultantName}
              createdAt={project.createdAt}
              status={project.status}
              statusLabel={getStatusLabel(project.status)}
              onView={() => handleViewProject(project.id)}
              onEdit={() => handleEditProject(project.id)}
              onDelete={() => handleDeleteProject(project.id, project.name)}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum projeto encontrado</p>
            <p className={styles.emptySubtext}>
              Ajuste os filtros ou crie um novo projeto
            </p>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, projectId: '', projectName: '' })}
        onConfirm={confirmDelete}
        title="Excluir Projeto"
        message={`Tem certeza que deseja excluir o projeto "${confirmModal.projectName}"? Esta ação é irreversível.`}
        type="danger"
        confirmText="Sim, Excluir"
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