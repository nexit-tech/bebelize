import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { UserRole, UserCreateInput } from '@/types';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './UserModal.module.css';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserCreateInput) => void;
  editData?: null; 
}

export default function UserModal({ isOpen, onClose, onSave, editData }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consultora');

  useEffect(() => {
    if (isOpen && !editData) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('consultora');
    }
  }, [isOpen, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, password, role });
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editData ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
            <FiX size={24} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            type="text"
            id="modalName"
            label="Nome Completo"
            placeholder="Ex: Maria Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            id="modalEmail"
            label="E-mail"
            placeholder="usuario@bebelize.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            id="modalPassword"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editData} 
          />

          <div className={styles.selectContainer}>
            <label htmlFor="modalRole" className={styles.label}>Perfil de Acesso</label>
            <select
              id="modalRole"
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              <option value="consultora">Consultora</option>
              <option value="atelier">Atelier</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              <FiSave size={18} />
              {editData ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}