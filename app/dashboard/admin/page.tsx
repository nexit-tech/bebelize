'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiDownload } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import AdminStats from '@/components/AdminStats/AdminStats';
import FilterBar from '@/components/FilterBar/FilterBar';
import AdminProjectCard from '@/components/AdminProjectCard/AdminProjectCard';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { mockProjects } from '@/mocks';
import styles from './admin.module.css';

export default function DashboardAdmin() {
  const router = useRouter();

  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterConsultant, setFilterConsultant] = useState('todos');

  // Estados dos Modais
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'warning' | 'success' | 'info' | 'danger'
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Estatísticas
  const stats = {
    total: mockProjects.length,
    negociacao: mockProjects.filter(p => p.status === 'negociacao').length,
    producao: mockProjects.filter(p => p.status === 'producao').length,
    finalizado: mockProjects.filter(p => p.status === 'finalizado').length,
    cancelado: mockProjects.filter(p => p.status === 'cancelado').length
  };

  // Handlers
  const handleCreateProject = () => {
    router.push('/projeto/criar');
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
    router.push(`/projeto/criar?id=${projectId}`);
  };

  const handleDeleteProject = (projectId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Projeto',
      message: 'Tem certeza que deseja excluir este projeto? Esta ação é irreversível e todos os dados serão perdidos permanentemente.',
      type: 'danger',
      onConfirm: () => {
        console.log('Projeto excluído:', projectId);
        setSuccessModal({
          isOpen: true,
          title: 'Projeto Excluído!',
          message: 'O projeto foi removido com sucesso do sistema.'
        });
      }
    });
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
              <h1 className={styles.title}>Painel do Administrador</h1>
              <p className={styles.subtitle}>Visão completa de todos os projetos e consultoras</p>
            </div>
            <div className={styles.headerActions}>
              <Button variant="secondary" onClick={handleExportReport}>
                <FiDownload size={18} />
                Exportar Relatório
              </Button>
              <Button variant="primary" onClick={handleCreateProject}>
                <FiPlus size={20} />
                Criar Projeto
              </Button>
            </div>
          </div>
        </header>

        {/* Estatísticas */}
        <AdminStats
          totalProjects={stats.total}
          inNegotiation={stats.negociacao}
          inProduction={stats.producao}
          completed={stats.finalizado}
          cancelled={stats.cancelado}
        />

        {/* Barra de Filtros */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterConsultant={filterConsultant}
          onFilterConsultantChange={setFilterConsultant}
        />

        {/* Grid de Projetos */}
        <div className={styles.projectsGrid}>
          {mockProjects.map((project) => (
            <AdminProjectCard
              key={project.id}
              id={project.id}
              projectName={project.name}
              clientName={project.clientName}
              consultantName={project.consultantName}
              createdAt={project.createdAt}
              status={project.status}
              statusLabel={project.statusLabel}
              onView={() => handleViewProject(project.id)}
              onEdit={() => handleEditProject(project.id)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {mockProjects.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum projeto encontrado</p>
            <p className={styles.emptySubtext}>Ajuste os filtros ou crie um novo projeto</p>
          </div>
        )}

      </main>

      {/* Modais */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

    </div>
  );
}