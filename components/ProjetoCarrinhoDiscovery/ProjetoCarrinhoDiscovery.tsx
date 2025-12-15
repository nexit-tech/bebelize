'use client';

import React from 'react';
import { FiClipboard } from 'react-icons/fi';
import type { DiscoveredItem } from '@/lib/discovery/types';
import type { LayerCustomization } from '@/types/rendering.types';
import Input from '../Input/Input';
import DatePicker from '../DatePicker/DatePicker';
import TextArea from '../TextArea/TextArea';
import CartItemCardDiscovery from '../CartItemCardDiscovery/CartItemCardDiscovery';
import styles from './ProjetoCarrinhoDiscovery.module.css';

export interface CartItem {
  cartItemId: string;
  item: DiscoveredItem;
  customizations?: LayerCustomization[];
  renderUrl?: string;
}

interface ProjetoCarrinhoDiscoveryProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  clientName: string;
  onClientNameChange: (name: string) => void;
  clientPhone: string;
  onClientPhoneChange: (phone: string) => void;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
  productionNotes: string;
  onProductionNotesChange: (notes: string) => void;
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
}

export default function ProjetoCarrinhoDiscovery({
  projectName,
  onProjectNameChange,
  clientName,
  onClientNameChange,
  clientPhone,
  onClientPhoneChange,
  deliveryDate,
  onDeliveryDateChange,
  productionNotes,
  onProductionNotesChange,
  cartItems,
  onRemoveItem
}: ProjetoCarrinhoDiscoveryProps) {
  
  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <FiClipboard className={styles.icon} size={20} />
          <h3 className={styles.title}>Ficha Técnica</h3>
        </div>
        <span className={styles.subtitle}>Preencha os dados para produção</span>
      </div>

      <div className={styles.scrollableContent}>
        <div className={styles.formSection}>
          <Input
            type="text"
            id="projectName"
            label="Nome do Projeto"
            placeholder="Ex: Enxoval - Maria Alice"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            required
          />

          <div className={styles.row}>
            <Input
              type="text"
              id="clientName"
              label="Cliente"
              placeholder="Nome completo"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              required
            />
            <Input
              type="tel"
              id="clientPhone"
              label="WhatsApp"
              placeholder="(00) 00000-0000"
              value={clientPhone}
              onChange={(e) => onClientPhoneChange(e.target.value)}
            />
          </div>

          <DatePicker
            id="deliveryDate"
            label="Entrega Prevista"
            value={deliveryDate}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            required
          />
        </div>

        <div className={styles.itemsSection}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Itens ({cartItems.length})</h4>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Nenhum item adicionado</p>
            </div>
          ) : (
            <div className={styles.list}>
              {cartItems.map(cartItem => (
                <CartItemCardDiscovery
                  key={cartItem.cartItemId}
                  cartItem={cartItem}
                  onRemove={() => onRemoveItem(cartItem.cartItemId)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.notesSection}>
          <TextArea
            id="productionNotes"
            label="Observações"
            placeholder="Detalhes especiais para o atelier..."
            value={productionNotes}
            onChange={(e) => onProductionNotesChange(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}