'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useUsers } from '@/hooks';
import { UserRole } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './criar-usuario.module.css';

export default function CriarUsuarioPage() {
  const router = useRouter();
  const { createUser } = useUsers();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consultora');
  const [successModal, setSuccessModal] = useState({ isOpen: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createUser({ name, email, password, role });
    
    setSuccessModal({ isOpen: true });
  };

  const handleModalClose = () => {
    setSuccessModal({ isOpen: false });
    router.push('/dashboard/admin/usuarios');
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <FiArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </header>

        <div className={styles.formCard}>
          <h1 className={styles.title}>Novo Usuário</h1>
          <p className={styles.subtitle}>Preencha os dados para criar um novo usuário</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              type="text"
              id="name"
              label="Nome Completo"
              placeholder="Ex: Maria Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="email"
              id="email"
              label="E-mail"
              placeholder="usuario@bebelize.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              id="password"
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className={styles.selectContainer}>
              <label htmlFor="role" className={styles.label}>Perfil de Acesso</label>
              <select
                id="role"
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

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                <FiSave size={18} />
                Criar Usuário
              </Button>
            </div>
          </form>
        </div>
      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleModalClose}
        title="Usuário Criado!"
        message="O novo usuário foi adicionado com sucesso ao sistema."
      />
    </div>
  );
}