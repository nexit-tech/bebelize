'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';
import { Item } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import CatalogoBrowser from '@/components/CatalogoBrowser/CatalogoBrowser';
import ProjetoCarrinho from '@/components/ProjetoCarrinho/ProjetoCarrinho';
import styles from './criar.module.css';

export default function CriarProjeto() {
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [cartItems, setCartItems] = useState<Item[]>([]);
  
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleAddItem = (item: Item) => {
    setCartItems(prev => {
      const isDuplicate = prev.find(i => i.id === item.id);
      if (isDuplicate) return prev;
      return [...prev, item];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSaveProject = () => {
    console.log('Salvando projeto:', {
      projectName,
      items: cartItems.map(item => item.id)
    });
    
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Salvo!',
      message: 'Seu projeto foi salvo com sucesso e está pronto para ser compartilhado.'
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
      
      <Sidebar />

      <main className={styles.mainContent}>
        
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

        <div className={styles.columnsLayout}>
          
          <div className={styles.columnLeft}>
            <div className={styles.card}>
              <CatalogoBrowser onAddItem={handleAddItem} />
            </div>
          </div>

          <div className={styles.columnRight}>
            <div className={styles.card}>
              <ProjetoCarrinho
                projectName={projectName}
                onProjectNameChange={setProjectName}
                cartItems={cartItems}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>

        </div>

      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

    </div>
  );
}