'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiEdit3, FiShoppingBag, FiArrowRight, FiRotateCcw, FiCloud, FiCheck } from 'react-icons/fi';
import { useProjects, useAuth } from '@/hooks';
import { useCart } from '@/hooks/useCart';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import TextArea from '@/components/TextArea/TextArea';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import CatalogoBrowser from '@/components/CatalogoBrowser/CatalogoBrowser';
import ItemCustomizerModal from '@/components/ItemCustomizerModal/ItemCustomizerModal';
import ProjetoCarrinhoDiscovery, { CartItem } from '@/components/ProjetoCarrinhoDiscovery/ProjetoCarrinhoDiscovery';
import styles from './criar.module.css';

export default function CriarProjetoPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createProject } = useProjects();
  
  const { 
    cartItems: savedItems, 
    updateCartItems, 
    isLoadingCart, 
    isSavingCart, 
    clearCart 
  } = useCart();

  const [step, setStep] = useState(1);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  
  // Estado local
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. Carga Inicial: Se houver rascunho, carrega no estado local
  useEffect(() => {
    if (!isLoadingCart && savedItems.length > 0 && !hasLoadedDraft) {
      setCartItems(savedItems);
      setHasLoadedDraft(true);
    }
  }, [savedItems, isLoadingCart, hasLoadedDraft]);

  // 2. Atualização: Função wrapper para atualizar local e remoto ao mesmo tempo
  const handleUpdateItems = (newItems: CartItem[]) => {
    setCartItems(newItems);
    updateCartItems(newItems);
  };

  const [customizerModal, setCustomizerModal] = useState<{
    isOpen: boolean;
    item: DiscoveredItem | null;
    editingCartItem?: CartItem;
  }>({
    isOpen: false,
    item: null
  });

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [productionNotes, setProductionNotes] = useState('');

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleNextStep = () => {
    if (cartItems.length === 0) {
      alert('Adicione pelo menos um item ao projeto antes de prosseguir.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSave = async () => {
    if (!projectName.trim() || !clientName.trim()) {
      alert('Nome do projeto e do cliente são obrigatórios.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Adicione pelo menos um item ao projeto antes de salvar.');
      return;
    }

    if (!currentUser?.id) {
      alert('Erro de autenticação. Recarregue a página.');
      return;
    }

    try {
      setIsSavingProject(true);
      
      const payload = {
        name: projectName,
        client_name: clientName,
        client_phone: clientPhone,
        production_notes: productionNotes,
        consultant_id: currentUser.id,
        status: 'producao',
        collection_id: cartItems[0]?.item.collection_id || 'geral',
        customizations_data: {
          cart_items: cartItems.map(i => ({
            cartItemId: i.id,
            item: i.item,
            customizations: i.customizations,
            renderUrl: i.renderUrl,
            variantId: i.variantId
          })),
          total_items: cartItems.length,
          created_at: new Date().toISOString()
        }
      };

      await createProject({ project: payload });
      
      // Limpa rascunho após sucesso
      await clearCart();
      setCartItems([]);

      setSuccessModal({
        isOpen: true,
        title: 'Projeto Criado!',
        message: 'A ordem de produção foi gerada e enviada para o atelier.'
      });
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      alert(`Erro ao criar projeto: ${error.message || 'Verifique os dados e tente novamente.'}`);
    } finally {
      setIsSavingProject(false);
    }
  };

  // --- Handlers de Itens ---

  const handleSelectSimpleItem = (item: DiscoveredItem) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item,
      customizations: [],
      renderUrl: item.image_url || '',
      variantId: item.variants?.[0]?.id
    };
    handleUpdateItems([...cartItems, newItem]);
    setShowBrowser(false);
  };

  const handleCustomizeCompositeItem = (item: DiscoveredItem) => {
    setCustomizerModal({ isOpen: true, item });
  };

  const handleFinishCustomization = (
    item: DiscoveredItem,
    customizations: LayerCustomization[],
    renderUrl: string,
    variantId?: string
  ) => {
    let newItemsList: CartItem[];

    if (customizerModal.editingCartItem) {
      newItemsList = cartItems.map(existing => 
        existing.id === customizerModal.editingCartItem!.id
          ? { ...existing, customizations, renderUrl, variantId }
          : existing
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item,
        customizations,
        renderUrl,
        variantId
      };
      newItemsList = [...cartItems, newItem];
    }
    
    handleUpdateItems(newItemsList);
    setCustomizerModal({ isOpen: false, item: null, editingCartItem: undefined });
    setShowBrowser(false);
  };

  const handleAddBulkItems = (items: { item: DiscoveredItem, customizations: LayerCustomization[], renderUrl: string }[]) => {
    const newItems = items.map(i => ({
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item: i.item,
      customizations: i.customizations,
      renderUrl: i.renderUrl,
      variantId: i.item.variants?.[0]?.id 
    }));
    handleUpdateItems([...cartItems, ...newItems]);
    setShowBrowser(false);
  };

  const handleEditItemFromList = (cartItem: CartItem) => {
    setCustomizerModal({
      isOpen: true,
      item: cartItem.item,
      editingCartItem: cartItem
    });
  };

  const handleCloseSuccess = () => {
    setSuccessModal({ ...successModal, isOpen: false });
    router.push('/dashboard/consultora');
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => router.back()}>
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>Nova Ordem de Produção</h1>
              <div className={styles.stepIndicator}>
                <span className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>
                  1. Seleção de Itens
                </span>
                <span className={styles.stepDivider}>/</span>
                <span className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>
                  2. Dados do Cliente
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.autoSaveStatus}>
             {isSavingCart ? (
               <><FiRotateCcw className={styles.spin} /> Salvando...</>
             ) : cartItems.length > 0 ? (
               <><FiCloud /> Rascunho salvo</>
             ) : null}
          </div>
        </header>

        <div className={styles.contentWrapper}>
          {step === 1 && (
            <div className={styles.stepContainer}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconCircle}>
                  <FiShoppingBag size={24} />
                </div>
                <div>
                  <h3>Itens do Enxoval</h3>
                  <p>Adicione os produtos que farão parte deste pedido.</p>
                </div>
              </div>
              
              <div className={styles.cartWrapper}>
                {isLoadingCart && !hasLoadedDraft ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spin} style={{ marginRight: 8 }}><FiRotateCcw /></div>
                    Verificando rascunhos...
                  </div>
                ) : (
                  <ProjetoCarrinhoDiscovery
                    items={cartItems}
                    onItemsChange={handleUpdateItems} // Usa o handler que salva direto
                    onBrowseMore={() => setShowBrowser(true)}
                    onEditItem={handleEditItemFromList} 
                  />
                )}
              </div>

              <div className={styles.actionFooter}>
                <div className={styles.itemsCount}>
                  {cartItems.length} {cartItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </div>
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={handleNextStep} 
                  disabled={cartItems.length === 0}
                >
                  Continuar para Dados <FiArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContainer}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconCircle}>
                  <FiEdit3 size={24} />
                </div>
                <div>
                  <h3>Dados do Projeto</h3>
                  <p>Preencha as informações do cliente para finalizar.</p>
                </div>
              </div>

              <div className={styles.formContainer}>
                <div className={styles.card}>
                  <div className={styles.formGrid}>
                    <Input
                      id="project-name"
                      type="text"
                      label="Nome do Projeto *"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Ex: Quarto da Maria"
                    />
                    <Input
                      id="client-name"
                      type="text"
                      label="Nome da Cliente *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nome completo"
                    />
                    <Input
                      id="client-phone"
                      type="tel"
                      label="WhatsApp / Contato"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                    <TextArea
                      label="Observações Iniciais"
                      value={productionNotes}
                      onChange={(e) => setProductionNotes(e.target.value)}
                      placeholder="Detalhes sobre prazos, entrega ou preferências..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.actionFooter}>
                <Button variant="secondary" size="large" onClick={handlePrevStep}>
                  <FiArrowLeft size={18} /> Voltar
                </Button>
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={handleSave} 
                  disabled={isSavingProject}
                >
                  <FiSave size={18} /> {isSavingProject ? 'Criando Projeto...' : 'Finalizar e Criar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showBrowser && (
        <div className={styles.overlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Adicionar Itens ao Projeto</h2>
              <button className={styles.closeButton} onClick={() => setShowBrowser(false)}>
                Fechar
              </button>
            </div>
            <div className={styles.modalBody}>
              <CatalogoBrowser
                onSelectSimpleItem={handleSelectSimpleItem}
                onCustomizeCompositeItem={handleCustomizeCompositeItem}
                onAddBulkItems={handleAddBulkItems}
              />
            </div>
          </div>
        </div>
      )}

      <ItemCustomizerModal
        isOpen={customizerModal.isOpen}
        onClose={() => setCustomizerModal({ isOpen: false, item: null, editingCartItem: undefined })}
        item={customizerModal.item}
        initialCustomizations={customizerModal.editingCartItem?.customizations}
        initialPreviewUrl={customizerModal.editingCartItem?.renderUrl}
        initialVariantId={customizerModal.editingCartItem?.variantId}
        onAddToProject={handleFinishCustomization}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleCloseSuccess}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}