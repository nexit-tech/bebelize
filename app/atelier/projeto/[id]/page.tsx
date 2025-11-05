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
import StatusSelector from '@/components/StatusSelector/StatusSelector';
import ProductionNotes from '@/components/ProductionNotes/ProductionNotes';
import ProjectDetailCard from '@/components/ProjectDetailCard/ProjectDetailCard';
import { ProjectStatus } from '@/types';
import styles from './atelier-projeto.module.css';

export default function AtelierProjetoPage() {
  const router = useRouter();
  const params = useParams();
  const { getProjectById, updateProject } = useProjects();
  const project = getProjectById(params.id as string);

  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(project?.status || 'rascunho');
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

  const handleStatusChange = (newStatus: ProjectStatus) => {
    setCurrentStatus(newStatus);
    updateProject(project.id, { status: newStatus });
    setSuccessModal({
      isOpen: true,
      title: 'Status Atualizado!',
      message: `O status do projeto foi alterado para: ${newStatus}.`
    });
  };

  const handleFinalizeProject = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmFinalize = () => {
    updateProject(project.id, { 
      status: 'finalizado',
      productionNotes 
    });
    setConfirmModal({ isOpen: false });
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Finalizado!',
      message: 'O projeto foi marcado como concluído e está pronto para entrega.'
    });
    setTimeout(() => router.push('/dashboard/atelier'), 2000);
  };

  const clientDetails = [
    { label: 'Cliente', value: project.clientName },
    { label: 'Telefone', value: project.clientPhone || 'N/A' },
    { label: 'E-mail', value: project.clientEmail || 'N/A' },
    { label: 'Consultora', value: project.consultantName },
  ];

  const projectDetails = [
    { label: 'Coleção', value: project.collectionName },
    { label: 'Criado em', value: formatDate(project.createdAt) },
    { label: 'Previsão de Entrega', value: project.deliveryDate ? formatDate(project.deliveryDate) : 'Não definida' },
  ];

  const specs = [
    { label: 'Tecido', value: project.customization.fabricName, code: project.customization.fabric },
    { label: 'Cor Principal', value: project.customization.primaryColor, code: project.customization.primaryColor },
    { label: 'Cor Secundária', value: project.customization.secondaryColor, code: project.customization.secondaryColor },
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
            <Button 
              variant="primary" 
              onClick={handleFinalizeProject}
              disabled={currentStatus !== 'producao'}
            >
              <FiCheckCircle size={18} />
              Finalizar Produção
            </Button>
          </div>
        </header>

        {/* Informações de Destaque */}
        <div className={styles.card}>
          <ProductionDetails
            projectName={project.name}
            clientName={project.clientName}
            createdAt={formatDate(project.createdAt)}
            collectionName={project.collectionName}
            priority={project.priority}
          />
        </div>

        {/* Detalhes e Status Selector (2 Colunas) */}
        <div className={styles.columnsLayout}>
          <ProjectDetailCard title="Informações do Cliente" items={clientDetails} />
          
          <div className={`${styles.card} ${styles.statusManagementCard}`}>
            <StatusSelector 
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
            />
            <div style={{ marginTop: '20px' }}>
              <ProjectDetailCard title="Detalhes do Pedido" items={projectDetails} />
            </div>
          </div>
        </div>

        {/* Especificações Técnicas e Checklist (2 Colunas) */}
        <div className={styles.columnsLayout}>
          <div className={styles.card}>
            <TechnicalSpecs specifications={specs} />
          </div>

          <div className={styles.card}>
            <ProductionNotes
              notes={productionNotes}
              onNotesChange={setProductionNotes}
            />
             <div className={styles.checklistSection}>
                <h2 className={styles.checklistTitle}>Checklist de Verificação</h2>
                <div className={styles.checklistItems}>
                  <label className={styles.checklistItem}>
                    <input type="checkbox" className={styles.checkbox} defaultChecked={currentStatus === 'finalizado'} />
                    <span>Tecido e cores conferidas</span>
                  </label>
                  <label className={styles.checklistItem}>
                    <input type="checkbox" className={styles.checkbox} defaultChecked={currentStatus === 'finalizado'} />
                    <span>Nome e estilo de bordado corretos</span>
                  </label>
                  <label className={styles.checklistItem}>
                    <input type="checkbox" className={styles.checkbox} defaultChecked={currentStatus === 'finalizado'} />
                    <span>Acabamento e costuras verificados</span>
                  </label>
                  <label className={styles.checklistItem}>
                    <input type="checkbox" className={styles.checkbox} defaultChecked={currentStatus === 'finalizado'} />
                    <span>Embalagem e etiquetas adequadas</span>
                  </label>
                </div>
              </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmFinalize}
        title="Finalizar Projeto"
        message="Confirma que o projeto foi produzido, verificado e está pronto para entrega ao cliente?"
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