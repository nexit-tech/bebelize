import { useState } from 'react';
import { Layer, Pattern, LayerCustomization } from '@/types/rendering.types';
import PatternSelector from '@/components/PatternSelector/PatternSelector';
import styles from './LayerCustomizer.module.css';

interface LayerCustomizerProps {
  layers: Layer[];
  patterns: Pattern[];
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

  const handleSelectPattern = (layerIndex: number, patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;

    const newCustomizations = customizations.filter(c => c.layer_index !== layerIndex);
    
    newCustomizations.push({
      layer_index: layerIndex,
      pattern_id: pattern.id,
      pattern_url: pattern.image_url,
      pattern_name: pattern.name
    });

    onCustomizationsChange(newCustomizations);
  };

  const toggleLayer = (layerIndex: number) => {
    setExpandedLayer(expandedLayer === layerIndex ? null : layerIndex);
  };

  const getSelectedPattern = (layerIndex: number): string | null => {
    const customization = customizations.find(c => c.layer_index === layerIndex);
    return customization?.pattern_id || null;
  };

  const getSelectedPatternName = (layerIndex: number): string => {
    const customization = customizations.find(c => c.layer_index === layerIndex);
    return customization?.pattern_name || 'Nenhuma textura selecionada';
  };

  return (
    <div className={styles.container}>
      {layers.map((layer) => (
        <div key={layer.index} className={styles.layerCard}>
          <button
            type="button"
            className={styles.layerHeader}
            onClick={() => toggleLayer(layer.index)}
          >
            <div className={styles.layerInfo}>
              <span className={styles.layerNumber}>Camada {layer.index}</span>
              <span className={styles.layerDescription}>
                {layer.description || layer.zone || 'Sem descrição'}
              </span>
            </div>
            <div className={styles.layerSelection}>
              <span className={styles.selectedPatternName}>
                {getSelectedPatternName(layer.index)}
              </span>
              <span className={styles.expandIcon}>
                {expandedLayer === layer.index ? '▼' : '▶'}
              </span>
            </div>
          </button>

          {expandedLayer === layer.index && (
            <div className={styles.layerContent}>
              <PatternSelector
                patterns={patterns}
                selectedPatternId={getSelectedPattern(layer.index)}
                onSelectPattern={(patternId) => handleSelectPattern(layer.index, patternId)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}