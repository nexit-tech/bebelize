import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import Button from '../Button/Button';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Entendi'
}: SuccessModalProps) {

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Ícone de Sucesso */}
        <div className={styles.iconContainer}>
          <div className={styles.checkCircle}>
            <FiCheckCircle size={56} />
          </div>
        </div>

        {/* Título */}
        <h2 className={styles.title}>{title}</h2>

        {/* Mensagem */}
        <p className={styles.message}>{message}</p>

        {/* Botão */}
        <Button type="button" variant="primary" onClick={onClose} fullWidth>
          {buttonText}
        </Button>

      </div>
    </div>
  );
}