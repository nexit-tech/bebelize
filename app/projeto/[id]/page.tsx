'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useProjects } from '@/hooks';
import { getStatusLabel, formatDate } from '@/utils';
import { Project } from '@/types';
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
  
  const [project, setProject] = useState<Project | null>(null);
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
    router.push(`/projeto/editar/${project?.id}`);
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

          <div className={styles.detailCard}>
            <h3 className={styles.cardTitle}>Detalhes do Projeto</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Coleção:</span>
              <span className={styles.detailValue}>{project.collectionName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Consultora:</span>
              <span className={styles.detailValue}>{project.consultantName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Criado em:</span>
              <span className={styles.detailValue}>{formatDate(project.createdAt)}</span>
            </div>
            {project.deliveryDate && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Previsão Entrega:</span>
                <span className={styles.detailValue}>{formatDate(project.deliveryDate)}</span>
              </div>
            )}
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.cardTitle}>Personalização</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Tecido:</span>
              <span className={styles.detailValue}>{project.customization.fabricName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Cor Principal:</span>
              <div className={styles.colorPreview}>
                <div 
                  className={styles.colorCircle} 
                  style={{ backgroundColor: project.customization.primaryColor }}
                />
                <span className={styles.detailValue}>{project.customization.primaryColor}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Cor Secundária:</span>
              <div className={styles.colorPreview}>
                <div 
                  className={styles.colorCircle} 
                  style={{ backgroundColor: project.customization.secondaryColor }}
                />
                <span className={styles.detailValue}>{project.customization.secondaryColor}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Bordado:</span>
              <span className={styles.detailValue}>{project.customization.embroideryName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Estilo:</span>
              <span className={styles.detailValue}>{project.customization.embroideryStyleName}</span>
            </div>
          </div>
        </div>

        {project.productionNotes && (
          <div className={styles.notesCard}>
            <h3 className={styles.cardTitle}>Notas de Produção</h3>
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