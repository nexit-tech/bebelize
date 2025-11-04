'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiCheckCircle } from 'react-icons/fi';
import { useProjects } from '@/hooks';
import { formatDate } from '@/utils';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import ProductionDetails from '@/components/ProductionDetails/ProductionDetails';
import TechnicalSpecs from '@/components/TechnicalSpecs/TechnicalSpecs';
import ProductionNotes from '@/components/ProductionNotes/ProductionNotes';
import styles from './atelier-projeto.module.css';

export default function AtelierProjetoPage() {
  const router = useRouter();
  const params = useParams();
  const { getProjectById, updateProject } = useProjects();
  const project = getProjectById(params.id as string);

  const [productionNotes, setProductionNotes] = useState(project?.productionNotes || '');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

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

  const handleDownloadPDF = () => {
    setSuccessModal({
      isOpen: true,
      title: 'Download Iniciado!',
      message: 'A Planta de Produção está sendo baixada.'
    });
  };

  const handleMarkAsComplete = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmComplete = () => {
    updateProject(project.id, { 
      status: 'finalizado',
      productionNotes 
    });
    setConfirmModal({ isOpen: false });
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Finalizado!',
      message: 'O projeto foi marcado como concluído.'
    });
    setTimeout(() => router.push('/dashboard/atelier'), 2000);
  };

  const specs = [
    { label: 'Tecido', value: project.customization.fabricName, code: project.customization.fabric },
    { label: 'Cor Principal', value: project.customization.primaryColor, code: '' },
    { label: 'Cor Secundária', value: project.customization.secondaryColor, code: '' },
    { label: 'Bordado - Nome', value: project.customization.embroideryName, code: '' },
    { label: 'Bordado - Estilo', value: project.customization.embroideryStyleName, code: project.customization.embroideryStyle }
  ];

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
            <Button variant="secondary" onClick={handleDownloadPDF}>
              <FiDownload size={18} />
              Baixar Planta
            </Button>
            <Button variant="primary" onClick={handleMarkAsComplete}>
              <FiCheckCircle size={18} />
              Finalizar
            </Button>
          </div>
        </header>

        <div className={styles.card}>
          <ProductionDetails
            projectName={project.name}
            clientName={project.clientName}
            createdAt={formatDate(project.createdAt)}
            collectionName={project.collectionName}
            priority={project.priority}
          />
        </div>

        <div className={styles.columnsLayout}>
          <div className={styles.card}>
            <TechnicalSpecs specifications={specs} />
          </div>
          <div className={styles.card}>
            <ProductionNotes
              notes={productionNotes}
              onNotesChange={setProductionNotes}
            />
          </div>
        </div>

        <div className={styles.checklistCard}>
          <h2 className={styles.cardTitle}>Checklist de Verificação</h2>
          <div className={styles.checklistItems}>
            <label className={styles.checklistItem}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Tecido correto conforme especificação</span>
            </label>
            <label className={styles.checklistItem}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Cores principais e secundárias conferidas</span>
            </label>
            <label className={styles.checklistItem}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Nome bordado corretamente</span>
            </label>
            <label className={styles.checklistItem}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Acabamento e costuras verificados</span>
            </label>
            <label className={styles.checklistItem}>
              <input type="checkbox" className={styles.checkbox} />
              <span>Embalagem adequada</span>
            </label>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmComplete}
        title="Finalizar Projeto"
        message="Confirma que o projeto foi produzido e está pronto para entrega?"
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