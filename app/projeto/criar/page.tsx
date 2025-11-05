'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';
import { Item, CustomizedItem } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import CatalogoBrowser from '@/components/CatalogoBrowser/CatalogoBrowser';
import ProjetoCarrinho from '@/components/ProjetoCarrinho/ProjetoCarrinho';
import ItemCustomizerModal from '@/components/ItemCustomizerModal/ItemCustomizerModal';
import styles from './criar.module.css';

export default function CriarProjeto() {
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [cartItems, setCartItems] = useState<CustomizedItem[]>([]);
  const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);
  const [itemToCustomize, setItemToCustomize] = useState<Item | null>(null);
  
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleOpenCustomizer = (item: Item) => {
    setItemToCustomize(item);
    setIsCustomizerModalOpen(true);
  };

  const handleCloseCustomizer = () => {
    setIsCustomizerModalOpen(false);
    setItemToCustomize(null);
  };

  const handleAddItem = (customizedItem: CustomizedItem) => {
    // Add the customized item to the cart. It uses cartItemId for unique identification.
    setCartItems(prev => [...prev, customizedItem]);
    handleCloseCustomizer();
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const handleSaveProject = () => {
    console.log('Salvando projeto:', {
      projectName,
      items: cartItems
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
              <CatalogoBrowser onCustomizeItem={handleOpenCustomizer} />
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

      <ItemCustomizerModal
        isOpen={isCustomizerModalOpen}
        onClose={handleCloseCustomizer}
        item={itemToCustomize}
        onSave={(itemWithCustomization) => handleAddItem({
          ...itemWithCustomization,
          // Garante que cada item no carrinho tenha um ID ÚNICO, mesmo que seja o mesmo ITEM (ID original)
          cartItemId: `cart-${Date.now()}` 
        })}
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