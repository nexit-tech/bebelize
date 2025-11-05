'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useUsers } from '@/hooks';
import { UserRole } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from '../../criar/criar-usuario.module.css';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const { getUserById, updateUser } = useUsers();
  const userId = params.id as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('consultora');
  const [successModal, setSuccessModal] = useState({ isOpen: false });

  useEffect(() => {
    if (userId) {
      const user = getUserById(userId);
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      } else {
        // Se o usuário não for encontrado, volta para a lista
        router.push('/dashboard/admin/usuarios');
      }
    }
  }, [userId, getUserById, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // O hook 'updateUser' lida com a atualização (não mexemos na senha aqui)
    updateUser(userId, { name, email, role });
    
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
          <h1 className={styles.title}>Editar Usuário</h1>
          <p className={styles.subtitle}>Atualize os dados do usuário</p>

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
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleModalClose}
        title="Usuário Atualizado!"
        message="Os dados do usuário foram atualizados com sucesso."
      />
    </div>
  );
}