import React from 'react';
import CollectionSelector from '../CollectionSelector/CollectionSelector';
import FabricSelector from '../FabricSelector/FabricSelector';
import ColorSwatch from '../ColorSwatch/ColorSwatch';
import Input from '../Input/Input';
import { collectionsData } from '@/data';
import styles from './Checklist.module.css';

interface ChecklistProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  selectedCollection: string;
  onCollectionChange: (collectionId: string) => void;
  selectedFabric: string;
  onFabricChange: (fabricId: string) => void;
  selectedPrimaryColor: string;
  onPrimaryColorChange: (color: string) => void;
  selectedSecondaryColor: string;
  onSecondaryColorChange: (color: string) => void;
  embroideryName: string;
  onEmbroideryNameChange: (name: string) => void;
  embroideryStyle: string;
  onEmbroideryStyleChange: (style: string) => void;
}

export default function Checklist({
  projectName,
  onProjectNameChange,
  selectedCollection,
  onCollectionChange,
  selectedFabric,
  onFabricChange,
  selectedPrimaryColor,
  onPrimaryColorChange,
  selectedSecondaryColor,
  onSecondaryColorChange,
  embroideryName,
  onEmbroideryNameChange,
  embroideryStyle,
  onEmbroideryStyleChange
}: ChecklistProps) {

  const fabrics = [
    { id: 'algodao', name: 'Algodão', texture: '/textures/cotton.jpg' },
    { id: 'linho', name: 'Linho', texture: '/textures/linen.jpg' },
    { id: 'misto', name: 'Misto', texture: '/textures/mixed.jpg' }
  ];

  const colors = [
    { id: 'bege', color: '#D4C5B9', label: 'Bege' },
    { id: 'rosa', color: '#E8C4C4', label: 'Rosa' },
    { id: 'azul', color: '#B0C4DE', label: 'Azul' },
    { id: 'verde', color: '#C8D5B9', label: 'Verde' },
    { id: 'branco', color: '#F8F8F8', label: 'Branco' }
  ];

  const embroideryStyles = [
    { value: 'script', label: 'Script (Cursiva)' },
    { value: 'block', label: 'Block (Maiúscula)' },
    { value: 'elegant', label: 'Elegant (Serifada)' }
  ];

  return (
    <div className={styles.checklistContainer}>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Informações do Projeto</h2>
        <Input
          type="text"
          id="projectName"
          label="Nome do Projeto"
          placeholder="Ex: Enxoval - Maria Alice"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          required
        />
      </section>

      <section className={styles.section}>
        <CollectionSelector
          collections={collectionsData}
          selectedCollection={selectedCollection}
          onSelect={onCollectionChange}
        />
      </section>

      {selectedCollection && (
        <>
          <section className={styles.section}>
            <FabricSelector
              fabrics={fabrics}
              selectedFabric={selectedFabric}
              onSelect={onFabricChange}
            />
          </section>

          <section className={styles.section}>
            <label className={styles.sectionTitle}>Cor Principal</label>
            <div className={styles.colorGrid}>
              {colors.map((color) => (
                <ColorSwatch
                  key={color.id}
                  color={color.color}
                  label={color.label}
                  selected={selectedPrimaryColor === color.id}
                  onClick={() => onPrimaryColorChange(color.id)}
                />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <label className={styles.sectionTitle}>Cor Secundária</label>
            <div className={styles.colorGrid}>
              {colors.map((color) => (
                <ColorSwatch
                  key={color.id}
                  color={color.color}
                  label={color.label}
                  selected={selectedSecondaryColor === color.id}
                  onClick={() => onSecondaryColorChange(color.id)}
                />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Personalização do Bordado</h3>
            <div className={styles.embroideryGroup}>
              <Input
                type="text"
                id="embroideryName"
                label="Nome para Bordar"
                placeholder="Ex: Maria Alice"
                value={embroideryName}
                onChange={(e) => onEmbroideryNameChange(e.target.value)}
              />
              
              <div className={styles.selectContainer}>
                <label htmlFor="embroideryStyle" className={styles.selectLabel}>
                  Estilo do Bordado
                </label>
                <select
                  id="embroideryStyle"
                  className={styles.select}
                  value={embroideryStyle}
                  onChange={(e) => onEmbroideryStyleChange(e.target.value)}
                >
                  <option value="">Selecione um estilo</option>
                  {embroideryStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}