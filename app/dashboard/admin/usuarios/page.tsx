'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useUsers } from '@/hooks';
import { UserRole } from '@/types';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import SearchBar from '@/components/SearchBar/SearchBar';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './usuarios.module.css';

export default function UsuariosPage() {
  const router = useRouter();
  const { users, deleteUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'todos'>('todos');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'todos' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      consultora: 'Consultora',
      atelier: 'Atelier',
      admin: 'Administrador'
    };
    return labels[role];
  };

  const handleCreateUser = () => {
    router.push('/admin/usuarios/criar');
  };

  const handleEditUser = (userId: string) => {
    router.push(`/admin/usuarios/editar/${userId}`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModal({
      isOpen: true,
      userId,
      userName
    });
  };

  const confirmDelete = () => {
    deleteUser(confirmModal.userId);
    setConfirmModal({ isOpen: false, userId: '', userName: '' });
    setSuccessModal({
      isOpen: true,
      title: 'Usuário Desativado!',
      message: 'O usuário foi desativado com sucesso.'
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
          >
            <FiArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Gerenciamento de Usuários</h1>
              <p className={styles.subtitle}>
                Gerencie consultoras, equipe de produção e administradores
              </p>
            </div>
            <Button variant="primary" onClick={handleCreateUser}>
              <FiPlus size={20} />
              Novo Usuário
            </Button>
          </div>
        </header>

        <div className={styles.toolbar}>
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome ou e-mail..."
          />

          <select 
            className={styles.filterSelect}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | 'todos')}
          >
            <option value="todos">Todos os Perfis</option>
            <option value="consultora">Consultora</option>
            <option value="atelier">Atelier</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className={styles.usersGrid}>
          {filteredUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>{user.name}</h3>
                <p className={styles.userEmail}>{user.email}</p>
                <span className={styles.userRole}>{getRoleLabel(user.role)}</span>
              </div>
              <div className={styles.userActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleEditUser(user.id)}
                >
                  <FiEdit2 size={18} />
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.danger}`}
                  onClick={() => handleDeleteUser(user.id, user.name)}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhum usuário encontrado</p>
            <p className={styles.emptySubtext}>Ajuste os filtros ou crie um novo usuário</p>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: '', userName: '' })}
        onConfirm={confirmDelete}
        title="Desativar Usuário"
        message={`Tem certeza que deseja desativar o usuário "${confirmModal.userName}"?`}
        type="danger"
        confirmText="Sim, Desativar"
        cancelText="Cancelar"
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}