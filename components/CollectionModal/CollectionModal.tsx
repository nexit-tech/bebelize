import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './CollectionModal.module.css';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => void;
  editData?: { name: string; description: string } | null;
}

export default function CollectionModal({ isOpen, onClose, onSave, editData }: CollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description });
    setName('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editData ? 'Editar Coleção' : 'Nova Coleção'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
            <FiX size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form className={styles.form} onSubmit={handleSubmit}>
          
          <Input
            type="text"
            id="collectionName"
            label="Nome da Coleção"
            placeholder="Ex: Coleção Anjos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className={styles.textareaContainer}>
            <label htmlFor="collectionDescription" className={styles.label}>
              Descrição
            </label>
            <textarea
              id="collectionDescription"
              className={styles.textarea}
              placeholder="Descreva a coleção..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Ações */}
          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editData ? 'Salvar Alterações' : 'Criar Coleção'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
}