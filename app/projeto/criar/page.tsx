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
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import styles from './criar.module.css';

interface CartItem {
  cartItemId: string;
  item: DiscoveredItem;
  customizations?: LayerCustomization[];
  renderUrl?: string;
}

export default function CriarProjeto() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createProject } = useProjects();

  const [projectName, setProjectName] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // --- Handlers de Carrinho e Modal ---

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
    handleCloseCustomizerModal(); // Fecha o modal após adicionar
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  // --- Handler de Salvamento (Lógica Nova) ---

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Por favor, dê um nome ao projeto.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Adicione pelo menos um item ao carrinho.');
      return;
    }
    if (!currentUser?.id) {
      alert('Erro de autenticação. Tente recarregar a página.');
      return;
    }

    try {
      setIsSaving(true);

      // Estrutura para salvar no Supabase
      // Usamos 'customizations_data' (JSON) para guardar o carrinho flexível
      const projectPayload = {
        name: projectName,
        client_name: 'Cliente Novo (Rascunho)', // Pode criar um input para isso depois
        consultant_id: currentUser.id,
        collection_id: cartItems[0].item.collection_id, // Usa a coleção do primeiro item como referência
        status: 'rascunho',
        priority: 'normal',
        customizations_data: {
          cart_items: cartItems, // Salva todo o carrinho aqui
          total_items: cartItems.length,
          created_at: new Date().toISOString()
        }
      };

      await createProject({ project: projectPayload });

      setSuccessModal({
        isOpen: true,
        title: 'Projeto Salvo!',
        message: 'O projeto foi criado com sucesso e já está disponível no seu dashboard.'
      });

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Ocorreu um erro ao salvar o projeto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    alert('Funcionalidade de PDF será implementada em breve!');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    router.push('/dashboard/consultora'); // Redireciona após salvar
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <Header
          onGoBack={handleGoBack}
          onGeneratePDF={handleGeneratePDF}
          onSaveProject={handleSaveProject}
          isSaving={isSaving}
        />

        <div className={styles.columnsLayout}>
          {/* Coluna da Esquerda: Catálogo */}
          <div className={styles.columnLeft}>
            <div className={styles.card} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <CatalogoBrowser
                onSelectSimpleItem={handleSelectSimpleItem}
                onCustomizeCompositeItem={handleCustomizeCompositeItem}
              />
            </div>
          </div>

          {/* Coluna da Direita: Carrinho */}
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

      {/* Modais */}
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

// Subcomponente de Header
interface HeaderProps {
  onGoBack: () => void;
  onGeneratePDF: () => void;
  onSaveProject: () => void;
  isSaving: boolean;
}

function Header({ onGoBack, onGeneratePDF, onSaveProject, isSaving }: HeaderProps) {
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
        <Button 
          variant="primary" 
          onClick={onSaveProject}
          disabled={isSaving}
        >
          <FiSave size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Projeto'}
        </Button>
      </div>
    </header>
  );
}