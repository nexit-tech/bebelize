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

  // Dados Mockados
  const mockProjects = [
    {
      id: '1',
      projectName: 'Enxoval - Maria Alice',
      clientName: 'Ana Paula Silva',
      consultantName: 'Ana Paula Silva',
      createdAt: '15/10/2024',
      status: 'negociacao' as const,
      statusLabel: 'Em Negociação'
    },
    {
      id: '2',
      projectName: 'Kit Berço - Pedro Henrique',
      clientName: 'Cliente de Carla',
      consultantName: 'Carla Mendes',
      createdAt: '12/10/2024',
      status: 'aprovado' as const,
      statusLabel: 'Aprovado'
    },
    {
      id: '3',
      projectName: 'Enxoval Completo - Sofia',
      clientName: 'Cliente de Juliana',
      consultantName: 'Juliana Costa',
      createdAt: '08/10/2024',
      status: 'producao' as const,
      statusLabel: 'Em Produção'
    },
    {
      id: '4',
      projectName: 'Kit Maternidade - Lucas',
      clientName: 'Cliente de Beatriz',
      consultantName: 'Beatriz Santos',
      createdAt: '05/10/2024',
      status: 'finalizado' as const,
      statusLabel: 'Finalizado'
    },
    {
      id: '5',
      projectName: 'Enxoval Premium - Isabella',
      clientName: 'Fernanda Oliveira',
      consultantName: 'Ana Paula Silva',
      createdAt: '20/09/2024',
      status: 'negociacao' as const,
      statusLabel: 'Em Negociação'
    },
    {
      id: '6',
      projectName: 'Kit Berço Anjos - Miguel',
      clientName: 'Patricia Lima',
      consultantName: 'Carla Mendes',
      createdAt: '18/09/2024',
      status: 'aprovado' as const,
      statusLabel: 'Aprovado'
    },
    {
      id: '7',
      projectName: 'Enxoval Cancelado - Gabriel',
      clientName: 'Cliente Desistente',
      consultantName: 'Juliana Costa',
      createdAt: '10/09/2024',
      status: 'cancelado' as const,
      statusLabel: 'Cancelado'
    },
    {
      id: '8',
      projectName: 'Kit Premium - Laura',
      clientName: 'Amanda Ferreira',
      consultantName: 'Beatriz Santos',
      createdAt: '01/10/2024',
      status: 'finalizado' as const,
      statusLabel: 'Finalizado'
    }
  ];

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
              projectName={project.projectName}
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