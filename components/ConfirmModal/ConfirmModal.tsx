import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import Button from '../Button/Button';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'success' | 'info' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning': return <FiAlertTriangle size={48} />;
      case 'success': return <FiCheckCircle size={48} />;
      case 'danger': return <FiAlertTriangle size={48} />;
      default: return <FiInfo size={48} />;
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.iconContainer} ${styles[type]}`}>
          {getIcon()}
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            {cancelText}
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} fullWidth>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}