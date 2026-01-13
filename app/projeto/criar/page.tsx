'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiEdit3, FiArrowRight, FiRotateCcw, FiCloud, FiLayout } from 'react-icons/fi';
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
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  useEffect(() => {
    if (!isLoadingCart && savedItems.length > 0 && !hasLoadedDraft) {
      setCartItems(savedItems);
      setHasLoadedDraft(true);
    }
  }, [savedItems, isLoadingCart, hasLoadedDraft]);

  const handleUpdateItems = (newItems: CartItem[]) => {
    setCartItems(newItems);
    updateCartItems(newItems);
  };

  const scrollToTop = () => {
    const mainElement = document.querySelector(`.${styles.main}`);
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    if (cartItems.length === 0) {
      alert('Adicione pelo menos um item ao projeto antes de prosseguir.');
      return;
    }
    setStep(prev => prev + 1);
    scrollToTop();
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    scrollToTop();
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

  const handleSelectSimpleItem = (item: DiscoveredItem) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item,
      customizations: [],
      renderUrl: item.image_url || '',
      variantId: item.variants?.[0]?.id
    };
    handleUpdateItems([...cartItems, newItem]);
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
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <button className={styles.backButton} onClick={() => router.back()}>
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className={styles.title}>Nova Ordem de Produção</h1>
                <div className={styles.steps}>
                  <span className={`${styles.step} ${step === 1 ? styles.active : ''}`}>
                    1. Seleção
                  </span>
                  <span className={styles.stepSeparator}></span>
                  <span className={`${styles.step} ${step === 2 ? styles.active : ''}`}>
                    2. Construção
                  </span>
                  <span className={styles.stepSeparator}></span>
                  <span className={`${styles.step} ${step === 3 ? styles.active : ''}`}>
                    3. Dados
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.actions}>
               {isSavingCart ? (
                 <span className={styles.step}><FiRotateCcw className={styles.spin} /> Salvando...</span>
               ) : cartItems.length > 0 ? (
                 <span className={styles.step}><FiCloud /> Rascunho salvo</span>
               ) : null}
            </div>
          </div>
        </header>

        {step === 1 && (
          <div className={styles.contentGrid}>
            <div className={styles.catalogSection}>
              <CatalogoBrowser
                onSelectSimpleItem={handleSelectSimpleItem}
                onCustomizeCompositeItem={handleCustomizeCompositeItem}
                onAddBulkItems={handleAddBulkItems}
              />
            </div>

            <div className={styles.cartSection}>
              <ProjetoCarrinhoDiscovery
                items={cartItems}
                onItemsChange={handleUpdateItems}
                onBrowseMore={() => {}}
                onEditItem={handleEditItemFromList} 
                showTitle={false}
                compact={true}
              />

              <div className={styles.cartSummary}>
                <div className={styles.itemsCount}>
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} no pedido
                </div>
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={handleNextStep} 
                  disabled={cartItems.length === 0}
                >
                  Continuar <FiArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.contentGrid}>
            <div className={styles.catalogSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconCircle}>
                  <FiLayout size={24} />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Construção do Pedido</h3>
                  <p style={{ color: 'var(--color-browning)', opacity: 0.7 }}>Visualização detalhada e ajustes finais (Em breve).</p>
                </div>
              </div>

              <div className={styles.constructionPlaceholder}>
                <p>Esta etapa de construção detalhada será implementada em breve.</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>Você pode prosseguir para os dados do cliente com os itens selecionados.</p>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                <Button variant="secondary" size="large" onClick={handlePrevStep}>
                  <FiArrowLeft size={18} /> Voltar
                </Button>
                <Button variant="primary" size="large" onClick={handleNextStep}>
                  Continuar <FiArrowRight size={18} />
                </Button>
              </div>
            </div>

            <div className={styles.cartSection}>
               <ProjetoCarrinhoDiscovery
                items={cartItems}
                onItemsChange={handleUpdateItems}
                onBrowseMore={() => {}}
                showTitle={true}
                compact={true}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.contentGrid}>
            <div className={styles.catalogSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconCircle}>
                  <FiEdit3 size={24} />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Dados do Cliente</h3>
                  <p style={{ color: 'var(--color-browning)', opacity: 0.7 }}>Preencha as informações para finalizar a ordem.</p>
                </div>
              </div>

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

              <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
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

            <div className={styles.cartSection} style={{ opacity: 0.9 }}>
               <ProjetoCarrinhoDiscovery
                items={cartItems}
                onItemsChange={handleUpdateItems}
                onBrowseMore={() => {}}
                showTitle={true}
                compact={true}
              />
            </div>
          </div>
        )}
      </main>

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