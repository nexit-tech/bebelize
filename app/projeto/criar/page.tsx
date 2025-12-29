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

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [productionNotes, setProductionNotes] = useState('');
  
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

  // --- Handlers de Adição ---

  const handleSelectSimpleItem = (item: DiscoveredItem) => {
    const cartItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // Handler para adição individual (via modal simples)
  const handleAddCustomizedItem = (
    item: DiscoveredItem,
    customizations: LayerCustomization[],
    renderUrl: string
  ) => {
    const cartItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item,
      customizations,
      renderUrl
    };
    setCartItems(prev => [...prev, cartItem]);
    setCustomizerModal({ isOpen: false, item: null });
  };

  // --- NOVO: Handler para Adição em Massa ---
  const handleAddBulkItems = (items: { item: DiscoveredItem, customizations: LayerCustomization[], renderUrl: string }[]) => {
    const newCartItems = items.map(entry => ({
      cartItemId: `cart-${Date.now()}-${entry.item.id}-${Math.random().toString(36).substr(2, 5)}`,
      item: entry.item,
      customizations: entry.customizations,
      renderUrl: entry.renderUrl
    }));
    
    setCartItems(prev => [...prev, ...newCartItems]);
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  // --- Salvamento do Projeto ---

  const handleSaveProject = async () => {
    if (!projectName.trim()) return alert('Por favor, dê um nome ao projeto.');
    if (!clientName.trim()) return alert('Por favor, informe o nome do cliente.');
    if (cartItems.length === 0) return alert('Adicione pelo menos um item à produção.');
    if (!currentUser?.id) return alert('Erro de autenticação.');

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
      alert('Ocorreu um erro ao salvar o projeto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => router.back();
  
  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, title: '', message: '' });
    router.push(currentUser?.role === 'atelier' ? '/dashboard/atelier' : '/dashboard/consultora');
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <Header
          onGoBack={handleGoBack}
          onSaveProject={handleSaveProject}
          isSaving={isSaving}
        />

        <div className={styles.columnsLayout}>
          {/* Coluna da Esquerda: Catálogo e Seleção */}
          <div className={styles.columnLeft}>
            <div className={styles.card}>
              <CatalogoBrowser
                onSelectSimpleItem={handleSelectSimpleItem}
                onCustomizeCompositeItem={handleCustomizeCompositeItem}
                onAddBulkItems={handleAddBulkItems} // Passando a nova função
              />
            </div>
          </div>

          {/* Coluna da Direita: Lista de Produção */}
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

      {/* Modal Individual (mantido para compatibilidade) */}
      <ItemCustomizerModal
        isOpen={customizerModal.isOpen}
        onClose={() => setCustomizerModal({ isOpen: false, item: null })}
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

function Header({ onGoBack, onSaveProject, isSaving }: any) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.backButton} onClick={onGoBack}>
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className={styles.title}>Nova Ordem de Produção</h1>
          <p className={styles.subtitle}>Monte a ficha técnica e envie para o atelier</p>
        </div>
      </div>
      <div className={styles.headerActions}>
        <Button variant="secondary" onClick={() => alert('Em breve')}>
          <FiFileText size={18} /> Imprimir Ficha
        </Button>
        <Button variant="primary" onClick={onSaveProject} disabled={isSaving}>
          <FiSave size={18} /> {isSaving ? 'Enviando...' : 'Enviar para Produção'}
        </Button>
      </div>
    </header>
  );
}