'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import Checklist from '@/components/Checklist/Checklist';
import Visualizer from '@/components/Visualizer/Visualizer';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './criar.module.css';

export default function CriarProjeto() {
  const router = useRouter();

  // Estados do Projeto
  const [projectName, setProjectName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedPrimaryColor, setSelectedPrimaryColor] = useState('');
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState('');
  const [embroideryName, setEmbroideryName] = useState('');
  const [embroideryStyle, setEmbroideryStyle] = useState('');

  // Estados dos Modais
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Handlers
  const handleSaveProject = () => {
    console.log('Salvando projeto:', {
      projectName,
      selectedCollection,
      selectedFabric,
      selectedPrimaryColor,
      selectedSecondaryColor,
      embroideryName,
      embroideryStyle
    });
    
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Salvo!',
      message: 'Seu projeto foi salvo com sucesso e está pronto para ser compartilhado com o cliente.'
    });
  };

  const handleGeneratePDF = () => {
    console.log('Gerando PDF de apresentação');
    
    setSuccessModal({
      isOpen: true,
      title: 'PDF Gerado!',
      message: 'O PDF de apresentação está pronto para download.'
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.backButton}
              onClick={handleGoBack}
              aria-label="Voltar"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>Criar Novo Projeto</h1>
              <p className={styles.subtitle}>Personalize cada detalhe do enxoval</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={handleGeneratePDF}>
              <FiFileText size={18} />
              Gerar PDF
            </Button>
            <Button variant="primary" onClick={handleSaveProject}>
              <FiSave size={18} />
              Salvar Projeto
            </Button>
          </div>
        </header>

        {/* Layout em 2 Colunas */}
        <div className={styles.columnsLayout}>
          
          {/* Coluna Esquerda: Checklist */}
          <div className={styles.columnLeft}>
            <div className={styles.card}>
              <Checklist
                projectName={projectName}
                onProjectNameChange={setProjectName}
                selectedCollection={selectedCollection}
                onCollectionChange={setSelectedCollection}
                selectedFabric={selectedFabric}
                onFabricChange={setSelectedFabric}
                selectedPrimaryColor={selectedPrimaryColor}
                onPrimaryColorChange={setSelectedPrimaryColor}
                selectedSecondaryColor={selectedSecondaryColor}
                onSecondaryColorChange={setSelectedSecondaryColor}
                embroideryName={embroideryName}
                onEmbroideryNameChange={setEmbroideryName}
                embroideryStyle={embroideryStyle}
                onEmbroideryStyleChange={setEmbroideryStyle}
              />
            </div>
          </div>

          {/* Coluna Direita: Visualizador */}
          <div className={styles.columnRight}>
            <div className={styles.card}>
              <Visualizer
                projectName={projectName}
                selectedCollection={selectedCollection}
                primaryColor={selectedPrimaryColor}
                secondaryColor={selectedSecondaryColor}
                embroideryName={embroideryName}
              />
            </div>
          </div>

        </div>

      </main>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

    </div>
  );
}