import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiCheck } from 'react-icons/fi';
import { Layer, LayerCustomization } from '@/types/rendering.types';
import { DiscoveredPattern } from '@/lib/discovery/patternScanner';
import styles from './LayerCustomizer.module.css';

interface LayerCustomizerProps {
  layers: Layer[];
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
  const [expandedLayer, setExpandedLayer] = useState<number | null>(layers[0]?.index || null);

  const handleSelectPattern = (layerIndex: number, pattern: DiscoveredPattern) => {
    const newCustomizations = [...customizations];
    const existingIndex = newCustomizations.findIndex(c => c.layer_index === layerIndex);

    const newEntry: LayerCustomization = {
      layer_index: layerIndex,
      pattern_id: pattern.id,
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

  const getSelectedPatternId = (layerIndex: number) => {
    return customizations.find(c => c.layer_index === layerIndex)?.pattern_id;
  };

  const sortedLayers = [...layers].sort((a, b) => a.index - b.index);

  return (
    <div className={styles.container}>
      {sortedLayers.map((layer) => {
        const isExpanded = expandedLayer === layer.index;
        const selectedId = getSelectedPatternId(layer.index);
        const selectedName = customizations.find(c => c.layer_index === layer.index)?.pattern_name;

        return (
          <div key={layer.index} className={`${styles.layerGroup} ${isExpanded ? styles.active : ''}`}>
            <button 
              className={styles.accordionHeader}
              onClick={() => setExpandedLayer(isExpanded ? null : layer.index)}
            >
              <div className={styles.headerInfo}>
                <span className={styles.layerTitle}>Camada {layer.index}</span>
                <span className={styles.layerSelection}>{selectedName || 'Nenhuma textura'}</span>
              </div>
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {isExpanded && (
              <div className={styles.patternGrid}>
                {patterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    className={`${styles.patternOption} ${selectedId === pattern.id ? styles.selected : ''}`}
                    onClick={() => handleSelectPattern(layer.index, pattern)}
                    title={pattern.name}
                  >
                    <img src={pattern.thumbnail_url} alt={pattern.name} className={styles.patternThumb} />
                    {selectedId === pattern.id && (
                      <div className={styles.checkOverlay}>
                        <FiCheck color="#FFF" size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}