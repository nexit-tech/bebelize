import React, { useState, useEffect } from 'react';
import { FiX, FiPackage } from 'react-icons/fi';
import { Item } from '@/types';
import Button from '../Button/Button';
import Input from '../Input/Input';
import FabricSelector from '../FabricSelector/FabricSelector';
import ColorSwatch from '../ColorSwatch/ColorSwatch';
import styles from './ItemCustomizerModal.module.css';

interface Customization {
  fabricId: string;
  primaryColorId: string;
  secondaryColorId: string;
  embroideryName: string;
  embroideryStyle: string;
}

interface ItemCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onSave: (customizedItem: Item & Customization) => void;
}

const MOCK_FABRICS = [
  { id: 'algodao', name: 'Algodão', texture: '/textures/cotton.jpg' },
  { id: 'linho', name: 'Linho', texture: '/textures/linen.jpg' },
  { id: 'misto', name: 'Misto', texture: '/textures/mixed.jpg' },
];

const MOCK_COLORS = [
  { id: 'bege', color: '#D4C5B9', label: 'Bege' },
  { id: 'rosa', color: '#E8C4C4', label: 'Rosa' },
  { id: 'azul', color: '#B0C4DE', label: 'Azul' },
  { id: 'verde', color: '#C8D5B9', label: 'Verde' },
  { id: 'branco', color: '#F8F8F8', label: 'Branco' },
];

const MOCK_EMBROIDERY_STYLES = [
  { value: 'script', label: 'Script (Cursiva)' },
  { value: 'block', label: 'Block (Maiúscula)' },
  { value: 'elegant', label: 'Elegant (Serifada)' },
];

export default function ItemCustomizerModal({
  isOpen,
  onClose,
  item,
  onSave,
}: ItemCustomizerModalProps) {
  const [customization, setCustomization] = useState<Customization>({
    fabricId: MOCK_FABRICS[0].id,
    primaryColorId: MOCK_COLORS[0].id,
    secondaryColorId: MOCK_COLORS[1].id,
    embroideryName: '',
    embroideryStyle: MOCK_EMBROIDERY_STYLES[0].value,
  });

  useEffect(() => {
    if (isOpen && item) {
      setCustomization({
        fabricId: MOCK_FABRICS[0].id,
        primaryColorId: MOCK_COLORS[0].id,
        secondaryColorId: MOCK_COLORS[1].id,
        embroideryName: '',
        embroideryStyle: MOCK_EMBROIDERY_STYLES[0].value,
      });
    }
  }, [isOpen, item]);

  const handleSave = () => {
    if (item) {
      onSave({ ...item, ...customization });
    }
    onClose();
  };

  if (!isOpen || !item) return null;
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Personalizar Item: {item.name}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.body}>
          
          <div className={styles.customizationPanel}>
            
            <FabricSelector
              fabrics={MOCK_FABRICS}
              selectedFabric={customization.fabricId}
              onSelect={(id) => setCustomization(prev => ({ ...prev, fabricId: id }))}
            />

            <section>
              <h3 className={styles.sectionTitle}>Cores</h3>
              <div className={styles.colorGrid}>
                {MOCK_COLORS.map((color) => (
                  <ColorSwatch
                    key={color.id}
                    color={color.color}
                    label={color.label}
                    selected={customization.primaryColorId === color.id}
                    onClick={() => setCustomization(prev => ({ ...prev, primaryColorId: color.id }))}
                  />
                ))}
              </div>
            </section>
            
            <section>
              <h3 className={styles.sectionTitle}>Bordado</h3>
              <div className={styles.embroideryGroup}>
                <Input
                  type="text"
                  id="embroideryName"
                  label="Nome para Bordar"
                  placeholder="Ex: Maria Alice"
                  value={customization.embroideryName}
                  onChange={(e) => setCustomization(prev => ({ ...prev, embroideryName: e.target.value }))}
                />
                
                <div className={styles.selectContainer}>
                  <label htmlFor="embroideryStyle" className={styles.selectLabel}>
                    Estilo do Bordado
                  </label>
                  <select
                    id="embroideryStyle"
                    className={styles.select}
                    value={customization.embroideryStyle}
                    onChange={(e) => setCustomization(prev => ({ ...prev, embroideryStyle: e.target.value }))}
                  >
                    {MOCK_EMBROIDERY_STYLES.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.visualContainer}>
            <h3 className={styles.sectionTitle}>Visualização</h3>
            <div className={styles.visualDisplay}>
                <FiPackage size={48} color={MOCK_COLORS.find(c => c.id === customization.primaryColorId)?.color || '#ccc'} />
                <h3 className={styles.visualTitle}>{item.name}</h3>
                <p className={styles.visualSubtitle}>{item.description}</p>
                {customization.embroideryName && (
                  <span className={styles.embroideryPreview}>
                    {customization.embroideryName}
                  </span>
                )}
            </div>
          </div>

        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Adicionar ao Pedido
          </Button>
        </div>

      </div>
    </div>
  );
}