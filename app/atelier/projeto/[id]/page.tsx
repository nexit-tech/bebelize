'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useProjects } from '@/hooks';
import { formatDate } from '@/utils';
import { ProjectStatus } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import ProductionDetails from '@/components/ProductionDetails/ProductionDetails';
import StatusSelector from '@/components/StatusSelector/StatusSelector';
import ProductionNotes from '@/components/ProductionNotes/ProductionNotes';
import ProjectDetailCard from '@/components/ProjectDetailCard/ProjectDetailCard';
// IMPORTAÇÃO NOVA
import { generatePDF } from '@/utils/pdfGenerator'; 
import styles from './atelier-projeto.module.css';

export default function AtelierProjetoPage() {
  const router = useRouter();
  const params = useParams();
  const { getProjectById, updateProject } = useProjects();
  
  const [project, setProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Estado para o loading do PDF
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>('rascunho');
  const [productionNotes, setProductionNotes] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    setIsLoading(true);
    const data = await getProjectById(params.id as string);
    if (data) {
      setProject(data);
      setCurrentStatus(data.status as ProjectStatus);
      setProductionNotes(data.production_notes || '');
    }
    setIsLoading(false);
  };

  // --- Lógica do Botão de Download ---
  const handleDownloadPDF = async () => {
    if (!project) return;

    try {
      setIsGeneratingPDF(true);
      
      // Prepara os dados para o gerador
      const renderImages = project?.customizations_data?.cart_items?.filter((item: any) => item.renderUrl) || [];
      if (renderImages.length === 0 && project?.preview_image_url) {
        renderImages.push({ renderUrl: project.preview_image_url, item: { name: 'Visualização Geral' } });
      }

      await generatePDF({
        name: project.name,
        clientName: project.clientName,
        collectionName: project.collectionName,
        createdAt: formatDate(project.created_at),
        deliveryDate: project.delivery_date ? formatDate(project.delivery_date) : undefined,
        customizationDescription: project.customizationDescription || [],
        productionNotes: productionNotes, // Usa o estado atual das notas
        renderImages: renderImages
      });

      setSuccessModal({
        isOpen: true,
        title: 'Sucesso!',
        message: 'A Ficha Técnica (PDF) foi gerada e baixada.'
      });

    } catch (error) {
      console.error(error);
      alert('Erro ao gerar PDF. Verifique se as imagens estão acessíveis.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (project) {
      setCurrentStatus(newStatus);
      const success = await updateProject(project.id, { status: newStatus });
      
      if (success) {
        setSuccessModal({
          isOpen: true,
          title: 'Status Atualizado!',
          message: `O status do projeto foi alterado para: ${newStatus}.`
        });
      }
    }
  };

  const handleFinalizeProject = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmFinalize = async () => {
    if (project) {
      const success = await updateProject(project.id, { 
        status: 'finalizado',
        production_notes: productionNotes 
      });
      
      setConfirmModal({ isOpen: false });
      
      if (success) {
        setSuccessModal({
          isOpen: true,
          title: 'Projeto Finalizado!',
          message: 'O projeto foi marcado como concluído e está pronto para entrega.'
        });
        setTimeout(() => router.push('/dashboard/atelier'), 2000);
      }
    }
  };

  const renderImages = project?.customizations_data?.cart_items?.filter((item: any) => item.renderUrl) || [];
  
  if (renderImages.length === 0 && project?.preview_image_url) {
    renderImages.push({ 
      renderUrl: project.preview_image_url, 
      item: { name: 'Visualização Geral' } 
    });
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? renderImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === renderImages.length - 1 ? 0 : prev + 1));
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

  const clientDetails = [
    { label: 'Cliente', value: project.clientName },
    { label: 'Telefone', value: project.clientPhone || 'N/A' },
    { label: 'E-mail', value: project.clientEmail || 'N/A' },
    { label: 'Consultora', value: project.consultantName },
  ];

  const projectDetails = [
    { label: 'Coleção', value: project.collectionName },
    { label: 'Criado em', value: formatDate(project.created_at) },
    { label: 'Previsão de Entrega', value: project.delivery_date ? formatDate(project.delivery_date) : 'Não definida' },
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
            <Button 
              variant="secondary" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF} // Desabilita enquanto gera
            >
              <FiDownload size={18} />
              {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar Planta'}
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

        <div className={styles.card}>
          <ProductionDetails
            projectName={project.name}
            clientName={project.clientName}
            createdAt={formatDate(project.created_at)}
            collectionName={project.collectionName}
            priority={project.priority}
          />
        </div>

        <div className={styles.columnsLayout}>
          
          {/* COLUNA ESQUERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ProjectDetailCard title="Informações do Cliente" items={clientDetails} />
            
            {/* Visualização da Planta (Carrossel) */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                Planta Visual 
                {renderImages.length > 1 && (
                  <span className={styles.counterBadge}>
                    {currentImageIndex + 1}/{renderImages.length}
                  </span>
                )}
              </h3>
              
              {renderImages.length > 0 ? (
                <div className={styles.carouselContainer}>
                  
                  {renderImages.length > 1 && (
                    <button onClick={handlePrevImage} className={`${styles.navButton} ${styles.prev}`}>
                      <FiChevronLeft size={24} />
                    </button>
                  )}

                  <div className={styles.imageWrapper}>
                    <img 
                      src={renderImages[currentImageIndex].renderUrl} 
                      alt="Planta do Projeto" 
                      className={styles.plantImage}
                    />
                    <p className={styles.imageLabel}>
                      {renderImages[currentImageIndex].item?.name || 'Item do Projeto'}
                    </p>
                  </div>

                  {renderImages.length > 1 && (
                    <button onClick={handleNextImage} className={`${styles.navButton} ${styles.next}`}>
                      <FiChevronRight size={24} />
                    </button>
                  )}
                  
                </div>
              ) : (
                <p className={styles.infoText} style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
                  Nenhuma imagem gerada para este projeto.
                </p>
              )}
            </div>

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

          {/* COLUNA DIREITA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Especificações Técnicas */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Especificações Técnicas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {project.customizationDescription && project.customizationDescription.length > 0 ? (
                  project.customizationDescription.map((desc: string, index: number) => (
                    <div key={index} className={styles.specItem}>
                      {desc}
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p><strong>Tecido:</strong> {project.customization?.fabricName || 'N/A'}</p>
                    <p><strong>Cor Principal:</strong> {project.customization?.primaryColor || 'N/A'}</p>
                    <p><strong>Cor Secundária:</strong> {project.customization?.secondaryColor || 'N/A'}</p>
                  </div>
                )}
              </div>
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