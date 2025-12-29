'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiEdit3 } from 'react-icons/fi';
import { useProjects, useAuth } from '@/hooks';
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

  const [isSaving, setIsSaving] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  
  // Estado para controlar o modal de customização
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

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
      setIsSaving(true);
      
      const payload = {
        name: projectName,
        client_name: clientName,
        client_phone: clientPhone,
        production_notes: productionNotes,
        consultant_id: currentUser.id,
        status: 'producao', // Define status inicial
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
      
      setSuccessModal({
        isOpen: true,
        title: 'Projeto Criado!',
        message: 'A ordem de produção foi gerada e enviada para o atelier.'
      });
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      alert(`Erro ao criar projeto: ${error.message || 'Verifique os dados e tente novamente.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers de Itens (Idênticos à Edição) ---

  const handleSelectSimpleItem = (item: DiscoveredItem) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item,
      customizations: [],
      renderUrl: item.image_url || '',
      variantId: item.variants?.[0]?.id
    };
    setCartItems(prev => [...prev, newItem]);
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
    if (customizerModal.editingCartItem) {
      setCartItems(prev => prev.map(existing => 
        existing.id === customizerModal.editingCartItem!.id
          ? { ...existing, customizations, renderUrl, variantId }
          : existing
      ));
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        item,
        customizations,
        renderUrl,
        variantId
      };
      setCartItems(prev => [...prev, newItem]);
    }
    
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
    setCartItems(prev => [...prev, ...newItems]);
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
              <p className={styles.subtitle}>Preencha os dados para iniciar um novo enxoval</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              <FiSave size={18} /> {isSaving ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </header>

        <div className={styles.contentWrapper}>
          <div className={styles.detailsColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiEdit3 size={18} /> Dados do Cliente
              </h3>
              <div className={styles.formGrid}>
                <Input
                  id="project-name"
                  type="text"
                  label="Nome do Projeto"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Quarto da Maria"
                />
                <Input
                  id="client-name"
                  type="text"
                  label="Nome da Cliente"
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

          <div className={styles.itemsColumn}>
            <div className={styles.card}>
              <ProjetoCarrinhoDiscovery
                items={cartItems}
                onItemsChange={setCartItems}
                onBrowseMore={() => setShowBrowser(true)}
                onEditItem={handleEditItemFromList} 
              />
            </div>
          </div>
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