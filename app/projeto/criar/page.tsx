'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import CatalogoBrowser from '@/components/CatalogoBrowser/CatalogoBrowser';
import ProjetoCarrinhoDiscovery from '@/components/ProjetoCarrinhoDiscovery/ProjetoCarrinhoDiscovery';
import ItemCustomizerModal from '@/components/ItemCustomizerModal/ItemCustomizerModal';
import styles from './criar.module.css';

interface CartItem {
  cartItemId: string;
  item: DiscoveredItem;
  customizations?: LayerCustomization[];
  renderUrl?: string;
}

export default function CriarProjeto() {
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const [customizerModal, setCustomizerModal] = useState<{
    isOpen: boolean;
    item: DiscoveredItem | null;
  }>({
    isOpen: false,
    item: null
  });

  const handleSelectSimpleItem = (item: DiscoveredItem) => {
    const cartItem: CartItem = {
      cartItemId: `cart-${Date.now()}`,
      item
    };
    setCartItems(prev => [...prev, cartItem]);
  };

  const handleCustomizeCompositeItem = (item: DiscoveredItem) => {
    setCustomizerModal({
      isOpen: true,
      item
    });
  };

  const handleCloseCustomizerModal = () => {
    setCustomizerModal({
      isOpen: false,
      item: null
    });
  };

  const handleAddCustomizedItem = (
    item: DiscoveredItem,
    customizations: LayerCustomization[],
    renderUrl: string
  ) => {
    const cartItem: CartItem = {
      cartItemId: `cart-${Date.now()}`,
      item,
      customizations,
      renderUrl
    };
    setCartItems(prev => [...prev, cartItem]);
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const handleSaveProject = () => {
    setSuccessModal({
      isOpen: true,
      title: 'Projeto Salvo!',
      message: 'Seu projeto foi salvo com sucesso.'
    });
  };

  const handleGeneratePDF = () => {
    setSuccessModal({
      isOpen: true,
      title: 'PDF Gerado!',
      message: 'O PDF de apresentação está pronto para download.'
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <Header
          onGoBack={handleGoBack}
          onGeneratePDF={handleGeneratePDF}
          onSaveProject={handleSaveProject}
        />

        <div className={styles.columnsLayout}>
          <div className={styles.columnLeft}>
            <div className={styles.card}>
              <CatalogoBrowser
                onSelectSimpleItem={handleSelectSimpleItem}
                onCustomizeCompositeItem={handleCustomizeCompositeItem}
              />
            </div>
          </div>

          <div className={styles.columnRight}>
            <div className={styles.card}>
              <ProjetoCarrinhoDiscovery
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
        isOpen={customizerModal.isOpen}
        onClose={handleCloseCustomizerModal}
        item={customizerModal.item}
        onAddToProject={handleAddCustomizedItem}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleCloseModal}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}

interface HeaderProps {
  onGoBack: () => void;
  onGeneratePDF: () => void;
  onSaveProject: () => void;
}

function Header({ onGoBack, onGeneratePDF, onSaveProject }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.backButton}
          onClick={onGoBack}
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
        <Button variant="secondary" onClick={onGeneratePDF}>
          <FiFileText size={18} />
          Gerar PDF
        </Button>
        <Button variant="primary" onClick={onSaveProject}>
          <FiSave size={18} />
          Salvar Projeto
        </Button>
      </div>
    </header>
  );
}