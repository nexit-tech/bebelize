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
import ProjetoCarrinhoDiscovery, { CartItem } from '@/components/ProjetoCarrinhoDiscovery/ProjetoCarrinhoDiscovery';
import ItemCustomizerModal from '@/components/ItemCustomizerModal/ItemCustomizerModal';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import styles from './criar.module.css';

export default function CriarProjeto() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createProject } = useProjects();

  // Estados do Projeto e Cliente
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [productionNotes, setProductionNotes] = useState('');
  
  // Estados do Carrinho
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modais
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
    handleCloseCustomizerModal();
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  // --- Handler de Salvamento ---

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Por favor, dê um nome ao projeto.');
      return;
    }
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Adicione pelo menos um item à produção.');
      return;
    }
    if (!currentUser?.id) {
      alert('Erro de autenticação. Tente recarregar a página.');
      return;
    }

    try {
      setIsSaving(true);

      const projectPayload: any = {
        name: projectName,
        client_name: clientName,
        client_phone: clientPhone,
        consultant_id: currentUser.id,
        collection_id: cartItems[0].item.collection_id, 
        status: 'producao',
        priority: 'normal',
        delivery_date: deliveryDate || null,
        production_notes: productionNotes || null,
        customizations_data: {
          cart_items: cartItems,
          total_items: cartItems.length,
          created_at: new Date().toISOString()
        }
      };

      await createProject({ project: projectPayload });

      setSuccessModal({
        isOpen: true,
        title: 'Ordem de Produção Criada!',
        message: 'A ficha técnica foi salva e enviada para a fila do atelier com sucesso.'
      });

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Ocorreu um erro ao salvar o projeto. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    alert('A geração de PDF da ficha técnica será implementada em breve!');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    if (currentUser?.role === 'atelier') {
      router.push('/dashboard/atelier');
    } else {
      router.push('/dashboard/consultora');
    }
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
            {/* Removemos o style inline para usar a classe CSS responsiva */}
            <div className={styles.card}>
              <CatalogoBrowser
                onSelectSimpleItem={handleSelectSimpleItem}
                onCustomizeCompositeItem={handleCustomizeCompositeItem}
              />
            </div>
          </div>

          {/* Coluna da Direita: Ficha Técnica (Antigo Carrinho) */}
          <div className={styles.columnRight}>
            <div className={styles.card}>
              <ProjetoCarrinhoDiscovery
                projectName={projectName}
                onProjectNameChange={setProjectName}
                clientName={clientName}
                onClientNameChange={setClientName}
                clientPhone={clientPhone}
                onClientPhoneChange={setClientPhone}
                deliveryDate={deliveryDate}
                onDeliveryDateChange={setDeliveryDate}
                productionNotes={productionNotes}
                onProductionNotesChange={setProductionNotes}
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
          <h1 className={styles.title}>Nova Ordem de Produção</h1>
          <p className={styles.subtitle}>Monte a ficha técnica e envie para o atelier</p>
        </div>
      </div>

      <div className={styles.headerActions}>
        <Button variant="secondary" onClick={onGeneratePDF}>
          <FiFileText size={18} />
          Imprimir Ficha
        </Button>
        <Button 
          variant="primary" 
          onClick={onSaveProject}
          disabled={isSaving}
        >
          <FiSave size={18} />
          {isSaving ? 'Enviando...' : 'Enviar para Produção'}
        </Button>
      </div>
    </header>
  );
}