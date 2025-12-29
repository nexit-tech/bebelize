'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import styles from './projeto.module.css';

export default function ProjetoEdicaoPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { getProjectById, updateProject } = useProjects();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showBrowser, setShowBrowser] = useState(false);
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

  useEffect(() => {
    async function loadProject() {
      if (!params.id) return;
      try {
        const data = await getProjectById(params.id as string);
        if (data) {
          setProjectName(data.name || '');
          setClientName(data.client_name || '');
          setClientPhone(data.client_phone || '');
          setProductionNotes(data.production_notes || '');
          
          const loadedItems = (data.customizations_data?.cart_items || []).map((item: any) => ({
            id: item.cartItemId || item.id || `cart-${Math.random().toString(36).substr(2, 9)}`,
            item: item.item,
            customizations: item.customizations || [],
            renderUrl: item.renderUrl || item.item.image_url,
            variantId: item.variantId
          }));
          setCartItems(loadedItems);
        }
      } catch (error) {
        console.error('Erro ao carregar projeto:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [params.id]);

  const handleSave = async () => {
    if (!projectName.trim() || !clientName.trim()) {
      alert('Nome do projeto e do cliente são obrigatórios.');
      return;
    }

    try {
      setIsSaving(true);
      
      const payload = {
        name: projectName,
        client_name: clientName,
        client_phone: clientPhone,
        production_notes: productionNotes,
        customizations_data: {
          cart_items: cartItems.map(i => ({
            cartItemId: i.id,
            item: i.item,
            customizations: i.customizations,
            renderUrl: i.renderUrl,
            variantId: i.variantId
          })),
          total_items: cartItems.length,
          updated_at: new Date().toISOString()
        }
      };

      await updateProject(params.id as string, payload);
      
      setSuccessModal({
        isOpen: true,
        title: 'Projeto Salvo!',
        message: 'Todas as alterações foram registradas com sucesso.'
      });
    } catch (error: any) {
      console.error('Erro detalhado ao salvar:', error);
      if (error?.message?.includes('column "customizations_data" of relation "projects" does not exist')) {
        alert('ERRO CRÍTICO: A coluna "customizations_data" não existe na tabela "projects".');
      } else {
        alert(`Erro ao salvar: ${error.message || 'Tente novamente.'}`);
      }
    } finally {
      setIsSaving(false);
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
    const redirectPath = currentUser?.role === 'atelier' ? '/dashboard/atelier' : '/dashboard/consultora';
    router.push(redirectPath);
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>Carregando dados...</div>
        </main>
      </div>
    );
  }

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
              <h1 className={styles.title}>Editar Projeto</h1>
              <p className={styles.subtitle}>Gerencie os detalhes e itens deste enxoval</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              <FiSave size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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
                  label="Observações Internas"
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
              <h2 className={styles.modalTitle}>Adicionar Novos Itens</h2>
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