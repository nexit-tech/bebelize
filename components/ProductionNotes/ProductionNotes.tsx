import React from 'react';
import styles from './ProductionNotes.module.css';

interface ProductionNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function ProductionNotes({ notes, onNotesChange }: ProductionNotesProps) {
  return (
    <div className={styles.notesContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notas de Produção</h3>
        <span className={styles.badge}>Opcional</span>
      </div>
      
      <p className={styles.description}>
        Adicione observações, dificuldades encontradas ou informações relevantes sobre a produção.
      </p>

      <textarea
        className={styles.textarea}
        placeholder="Ex: Ajuste necessário no tamanho do bordado..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={6}
        aria-label="Notas de produção"
      />

      <div className={styles.footer}>
        <span className={styles.footerText}>
          As notas serão anexadas ao histórico do projeto
        </span>
      </div>
    </div>
  );
}