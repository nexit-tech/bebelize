import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './ItemModal.module.css';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; code: string }) => void;
  editData?: { name: string; description: string; code: string } | null;
}

export default function ItemModal({ isOpen, onClose, onSave, editData }: ItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);
      setCode(editData.code);
    } else {
      setName('');
      setDescription('');
      setCode('');
    }
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, code });
    setName('');
    setDescription('');
    setCode('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editData ? 'Editar Item' : 'Novo Item'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
            <FiX size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form className={styles.form} onSubmit={handleSubmit}>
          
          <Input
            type="text"
            id="itemName"
            label="Nome do Item"
            placeholder="Ex: Kit Berço Premium"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="text"
            id="itemCode"
            label="Código do Item"
            placeholder="Ex: ITEM-001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <div className={styles.textareaContainer}>
            <label htmlFor="itemDescription" className={styles.label}>
              Descrição
            </label>
            <textarea
              id="itemDescription"
              className={styles.textarea}
              placeholder="Descreva o item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Ações */}
          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editData ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}