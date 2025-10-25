'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import ProductionHeader from '@/components/ProductionHeader/ProductionHeader';
import ProductionCard from '@/components/ProductionCard/ProductionCard';
import SearchBar from '@/components/SearchBar/SearchBar';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './producao.module.css';

export default function DashboardProducao() {
  const router = useRouter();

  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('todos');

  // Estados dos Modais
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info' as 'warning' | 'success' | 'info' | 'danger'
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
      projectName: 'Enxoval Completo - Sofia',
      clientName: 'Juliana Costa',
      createdAt: '08/10/2024',
      priority: 'urgent' as const
    },
    {
      id: '2',
      projectName: 'Kit Berço - Pedro Henrique',
      clientName: 'Carla Mendes',
      createdAt: '12/10/2024',
      priority: 'normal' as const
    },
    {
      id: '3',
      projectName: 'Enxoval Premium - Isabella',
      clientName: 'Fernanda Oliveira',
      createdAt: '20/09/2024',
      priority: 'urgent' as const
    },
    {
      id: '4',
      projectName: 'Kit Maternidade - Gabriel',
      clientName: 'Patricia Santos',
      createdAt: '15/10/2024',
      priority: 'normal' as const
    },
    {
      id: '5',
      projectName: 'Enxoval Anjos - Laura',
      clientName: 'Beatriz Lima',
      createdAt: '18/10/2024',
      priority: 'normal' as const
    },
    {
      id: '6',
      projectName: 'Kit Berço Premium - Lucas',
      clientName: 'Amanda Ferreira',
      createdAt: '10/10/2024',
      priority: 'urgent' as const
    }
  ];

  const urgentProjects = mockProjects.filter(p => p.priority === 'urgent').length;

  // Handlers
  const handleViewDetails = (projectId: string) => {
    console.log('Ver detalhes do projeto:', projectId);
    router.push(`/producao/projeto/${projectId}`);
  };

  const handleMarkAsComplete = (projectId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Finalizar Projeto',
      message: 'Confirma que este projeto foi produzido e está pronto para entrega?',
      type: 'success',
      onConfirm: () => {
        console.log('Projeto finalizado:', projectId);
        setSuccessModal({
          isOpen: true,
          title: 'Projeto Finalizado!',
          message: 'O projeto foi marcado como concluído e está pronto para entrega ao cliente.'
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
          <div>
            <h1 className={styles.title}>Fila de Produção</h1>
            <p className={styles.subtitle}>Projetos aguardando fabricação</p>
          </div>
        </header>

        {/* Header de Estatísticas */}
        <ProductionHeader 
          totalProjects={mockProjects.length}
          urgentProjects={urgentProjects}
        />

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
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filtrar por prioridade"
            >
              <option value="todos">Todas as Prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Grid de Projetos */}
        <div className={styles.projectsGrid}>
          {mockProjects.map((project) => (
            <ProductionCard
              key={project.id}
              id={project.id}
              projectName={project.projectName}
              clientName={project.clientName}
              createdAt={project.createdAt}
              priority={project.priority}
              onViewDetails={() => handleViewDetails(project.id)}
              onMarkAsComplete={() => handleMarkAsComplete(project.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {mockProjects.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum projeto em produção</p>
            <p className={styles.emptySubtext}>Todos os projetos estão finalizados</p>
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
        confirmText="Sim, Finalizar"
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