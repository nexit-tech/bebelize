'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { useProjects } from '@/hooks';
import { getStatusLabel } from '@/utils';
import Sidebar from '@/components/Sidebar/Sidebar';
import StatusTag from '@/components/StatusTag/StatusTag';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './projeto.module.css';

export default function ProjetoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const { getProjectById, deleteProject } = useProjects();
  
  const [project, setProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    setIsLoading(true);
    const data = await getProjectById(params.id as string);
    setProject(data || null);
    setIsLoading(false);
  };

  const handleEdit = () => {
    // router.push(`/projeto/editar/${project?.id}`);
    alert("Edição completa será habilitada em breve.");
  };

  const handleDelete = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmDelete = async () => {
    if (project) {
      const success = await deleteProject(project.id);
      setConfirmModal({ isOpen: false });
      
      if (success) {
        setSuccessModal({
          isOpen: true,
          title: 'Projeto Excluído!',
          message: 'O projeto foi removido com sucesso.'
        });
        setTimeout(() => router.push('/dashboard/consultora'), 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <p>Projeto não encontrado</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <FiArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={handleEdit}>
              <FiEdit2 size={18} />
              Editar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <FiTrash2 size={18} />
              Excluir
            </Button>
          </div>
        </header>

        <div className={styles.projectHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.projectName}>{project.name}</h1>
            <StatusTag status={project.status}>{getStatusLabel(project.status)}</StatusTag>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          {/* Card: Cliente */}
          <div className={styles.detailCard}>
            <h3 className={styles.cardTitle}>Informações do Cliente</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Nome:</span>
              <span className={styles.detailValue}>{project.clientName}</span>
            </div>
            {project.clientPhone && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Telefone:</span>
                <span className={styles.detailValue}>{project.clientPhone}</span>
              </div>
            )}
            {project.clientEmail && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>E-mail:</span>
                <span className={styles.detailValue}>{project.clientEmail}</span>
              </div>
            )}
          </div>

          {/* Card: Detalhes do Pedido */}
          <div className={styles.detailCard}>
            <h3 className={styles.cardTitle}>Detalhes do Projeto</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Coleção Base:</span>
              <span className={styles.detailValue}>{project.collectionName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Consultora:</span>
              <span className={styles.detailValue}>{project.consultantName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Criado em:</span>
              <span className={styles.detailValue}>{project.createdAtFormatted}</span>
            </div>
            {project.deliveryDateFormatted && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Previsão Entrega:</span>
                <span className={styles.detailValue}>{project.deliveryDateFormatted}</span>
              </div>
            )}
          </div>

          {/* Card: Itens e Personalização (DADOS REAIS) */}
          <div className={styles.detailCard} style={{ gridColumn: '1 / -1' }}>
            <h3 className={styles.cardTitle}>Itens e Personalizações</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {project.customizationDescription && project.customizationDescription.length > 0 ? (
                project.customizationDescription.map((desc: string, index: number) => (
                  <div key={index} style={{ 
                    padding: '12px', 
                    backgroundColor: '#FAFAFA', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #A68E80',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: '#594E4A'
                  }}>
                    {desc}
                  </div>
                ))
              ) : (
                <p className={styles.notesText}>Nenhuma personalização registrada.</p>
              )}
            </div>
          </div>
        </div>

        {/* Card: Notas de Produção */}
        {project.productionNotes && (
          <div className={styles.notesCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FiFileText size={20} color="#A68E80" />
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Notas de Produção</h3>
            </div>
            <p className={styles.notesText}>{project.productionNotes}</p>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmDelete}
        title="Excluir Projeto"
        message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
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