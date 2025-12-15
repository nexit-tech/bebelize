'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiSettings, FiRefreshCw, FiSave, FiInfo } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useCollections } from '@/hooks/useCollections';
import Sidebar from '@/components/Sidebar/Sidebar';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import styles from './configuracoes.module.css';

export default function ConfiguracoesPage() {
  const { currentUser } = useAuth();
  const { updateUser } = useUsers();
  const { refresh: refreshCatalog } = useCollections();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSavingProfile(true);
    
    try {
      const success = await updateUser(currentUser.id, { name });
      
      if (success) {
        setSuccessModal({
          isOpen: true,
          title: 'Perfil Atualizado',
          message: 'Suas informações foram salvas com sucesso.'
        });
      } else {
        alert('Erro ao atualizar perfil.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSyncCatalog = async () => {
    setIsSyncing(true);
    try {
      await refreshCatalog(true);
      setSuccessModal({
        isOpen: true,
        title: 'Catálogo Sincronizado',
        message: 'O sistema verificou o storage e atualizou a lista de coleções e itens.'
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao sincronizar catálogo.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>Gerencie suas preferências e ferramentas do sistema</p>
        </header>

        <div className={styles.grid}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiUser size={24} className={styles.cardIcon} />
              <div>
                <h2 className={styles.cardTitle}>Meu Perfil</h2>
                <p className={styles.cardDescription}>Atualize seus dados pessoais</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className={styles.formGroup}>
              <Input
                type="text"
                id="name"
                label="Nome de Exibição"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
              <Input
                type="email"
                id="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={() => {}}
                inputClassName="disabled" 
                required
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '-10px' }}>
                O e-mail não pode ser alterado por aqui. Contate um administrador.
              </p>

              <div style={{ marginTop: '16px' }}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth
                  disabled={isSavingProfile || name === currentUser?.name}
                >
                  <FiSave size={18} />
                  {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiSettings size={24} className={styles.cardIcon} />
              <div>
                <h2 className={styles.cardTitle}>Ferramentas do Sistema</h2>
                <p className={styles.cardDescription}>Manutenção e atualizações</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.infoBox}>
                <FiInfo size={20} color="#7B92B0" style={{ flexShrink: 0 }} />
                <p className={styles.infoText}>
                  Use esta ferramenta se você adicionou novas imagens ou pastas no Storage e elas ainda não apareceram no Catálogo.
                </p>
              </div>

              <Button 
                type="button" 
                variant="secondary" 
                fullWidth 
                onClick={handleSyncCatalog}
                disabled={isSyncing}
              >
                <FiRefreshCw size={18} className={isSyncing ? 'spin' : ''} />
                {isSyncing ? 'Sincronizando...' : 'Forçar Sincronização do Catálogo'}
              </Button>
            </div>
          </div>

        </div>
      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}