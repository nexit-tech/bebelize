import { Pattern } from '@/types/rendering.types';
import styles from './PatternSelector.module.css';

interface PatternSelectorProps {
  patterns: Pattern[];
  selectedPatternId: string | null;
  onSelectPattern: (patternId: string) => void;
  disabled?: boolean;
}

export default function PatternSelector({
  patterns,
  selectedPatternId,
  onSelectPattern,
  disabled = false
}: PatternSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            type="button"
            className={`${styles.patternButton} ${
              selectedPatternId === pattern.id ? styles.selected : ''
            }`}
            onClick={() => onSelectPattern(pattern.id)}
            disabled={disabled}
            title={pattern.name}
          >
            <img
              src={pattern.thumbnail_url || pattern.image_url}
              alt={pattern.name}
              className={styles.patternImage}
            />
            <span className={styles.patternNumber}>
              {patterns.indexOf(pattern) + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}