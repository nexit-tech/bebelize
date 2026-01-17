'use client';

import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiCheck, FiLayers } from 'react-icons/fi';
import { LayerCustomization } from '@/types/rendering.types';
import type { DiscoveredLayer, DiscoveredPattern } from '@/lib/discovery/types';
import styles from './LayerCustomizer.module.css';

interface LayerCustomizerProps {
  layers: DiscoveredLayer[];
  patterns: DiscoveredPattern[];
  customizations: LayerCustomization[];
  onCustomizationsChange: (customizations: LayerCustomization[]) => void;
}

export default function LayerCustomizer({
  layers,
  patterns,
  customizations,
  onCustomizationsChange
}: LayerCustomizerProps) {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  const sortedLayers = [...layers].sort((a, b) => a.index - b.index);

  const handleSelectPattern = (layerIndex: number, pattern: DiscoveredPattern) => {
    const newCustomizations = [...customizations];
    const existingIndex = newCustomizations.findIndex(c => c.layer_index === layerIndex);

    // Lógica de Toggle: Se clicar na mesma textura já selecionada, remove a seleção
    if (existingIndex >= 0 && newCustomizations[existingIndex].patternId === pattern.id) {
      newCustomizations.splice(existingIndex, 1);
      onCustomizationsChange(newCustomizations);
      return;
    }

    const newEntry: LayerCustomization = {
      layerId: layerIndex.toString(),
      patternId: pattern.id,
      layer_index: layerIndex,
      pattern_url: pattern.url,
      pattern_name: pattern.name
    };

    if (existingIndex >= 0) {
      newCustomizations[existingIndex] = newEntry;
    } else {
      newCustomizations.push(newEntry);
    }

    onCustomizationsChange(newCustomizations);
  };

  const getSelectedPatternInfo = (layerIndex: number) => {
    return customizations.find(c => c.layer_index === layerIndex);
  };

  return (
    <div className={styles.container}>
      {sortedLayers.map((layer) => {
        const isExpanded = expandedLayer === layer.index;
        const selectedInfo = getSelectedPatternInfo(layer.index);
        
        return (
          <div 
            key={layer.index} 
            className={`${styles.layerCard} ${isExpanded ? styles.active : ''} ${selectedInfo ? styles.completed : ''}`}
          >
            <button 
              className={styles.accordionHeader}
              onClick={() => setExpandedLayer(isExpanded ? null : layer.index)}
            >
              <div className={styles.headerLeft}>
                <div className={`${styles.statusIndicator} ${selectedInfo ? styles.statusDone : ''}`}>
                  {selectedInfo ? <FiCheck size={12} /> : <FiLayers size={12} />}
                </div>
                <div className={styles.headerText}>
                  <span className={styles.layerTitle}>{layer.name}</span>
                  <span className={styles.layerSubtitle}>
                    {selectedInfo ? selectedInfo.pattern_name : 'Toque para escolher'}
                  </span>
                </div>
              </div>
              
              <div className={styles.headerRight}>
                {selectedInfo && (
                  <div className={styles.miniPreview}>
                     <img src={selectedInfo.pattern_url} alt="selected" />
                  </div>
                )}
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </div>
            </button>

            <div className={`${styles.accordionContent} ${isExpanded ? styles.expanded : ''}`}>
              <div className={styles.patternGrid}>
                {patterns.map((pattern) => {
                  const isSelected = selectedInfo?.patternId === pattern.id;
                  return (
                    <button
                      key={pattern.id}
                      className={`${styles.patternOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleSelectPattern(layer.index, pattern)}
                      title={pattern.name}
                    >
                      <div className={styles.thumbWrapper}>
                        <img 
                          src={pattern.thumbnail_url || pattern.url} 
                          alt={pattern.name} 
                          className={styles.patternThumb} 
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className={styles.selectedOverlay}>
                            <FiCheck size={20} />
                          </div>
                        )}
                      </div>
                      <span className={styles.patternName}>{pattern.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}