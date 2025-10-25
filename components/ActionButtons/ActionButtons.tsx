import React from 'react';
import { FiFileText, FiPackage, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Button from '../Button/Button';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  onGenerateClientPDF: () => void;
  onGenerateProductionPDF: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionButtons({
  onGenerateClientPDF,
  onGenerateProductionPDF,
  onEdit,
  onDelete
}: ActionButtonsProps) {
  return (
    <div className={styles.actionsContainer}>
      
      {/* Seção: Documentos */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Documentos</h3>
        <div className={styles.buttonGroup}>
          <button className={styles.actionButton} onClick={onGenerateClientPDF}>
            <FiFileText size={20} className={styles.icon} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>PDF para Cliente</span>
              <span className={styles.buttonDescription}>Apresentação elegante</span>
            </div>
          </button>

          <button className={styles.actionButton} onClick={onGenerateProductionPDF}>
            <FiPackage size={20} className={styles.icon} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>Planta de Produção</span>
              <span className={styles.buttonDescription}>Especificações técnicas</span>
            </div>
          </button>
        </div>
      </div>

      {/* Seção: Gerenciamento */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Gerenciamento</h3>
        <div className={styles.buttonGroup}>
          <button className={styles.actionButton} onClick={onEdit}>
            <FiEdit2 size={20} className={styles.icon} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>Editar Projeto</span>
              <span className={styles.buttonDescription}>Modificar personalizações</span>
            </div>
          </button>

          <button className={`${styles.actionButton} ${styles.danger}`} onClick={onDelete}>
            <FiTrash2 size={20} className={styles.icon} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>Excluir Projeto</span>
              <span className={styles.buttonDescription}>Ação irreversível</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}