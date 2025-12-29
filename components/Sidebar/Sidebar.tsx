'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiPackage, FiUsers, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/hooks';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getMenuItems = () => {
    if (currentUser?.role === 'consultora') {
      return [
        {
          label: 'Meus Projetos',
          href: '/dashboard/consultora',
          icon: FiGrid
        },
        {
          label: 'Catálogo',
          href: '/catalogo',
          icon: FiPackage
        }
      ];
    }

    if (currentUser?.role === 'atelier') {
      return [
        {
          label: 'Fila de Produção',
          href: '/dashboard/atelier',
          icon: FiGrid
        },
        {
          label: 'Catálogo',
          href: '/catalogo',
          icon: FiPackage
        }
      ];
    }

    if (currentUser?.role === 'admin') {
      return [
        {
          label: 'Dashboard',
          href: '/dashboard/admin',
          icon: FiGrid
        },
        {
          label: 'Usuários',
          href: '/admin/usuarios',
          icon: FiUsers
        },
        {
          label: 'Catálogo',
          href: '/catalogo',
          icon: FiPackage
        }
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  const handleLogoutConfirmation = () => {
    setIsLogoutModalOpen(true);
    setIsMobileOpen(false);
  };

  const confirmLogout = () => {
    logout();
    router.push('/login');
    setIsLogoutModalOpen(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button 
        className={styles.mobileToggle}
        onClick={toggleMobileSidebar}
        aria-label="Menu"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {isMobileOpen && (
        <div className={styles.overlay} onClick={closeMobileSidebar} />
      )}

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoContainer}>
          <Image 
            src="/bebelizelogo.jpg" 
            alt="Logo Bebelize" 
            width={60}
            height={60}
            className={styles.logo}
          />
          <span className={styles.brandName}>Bebelize</span>
        </div>

        <nav className={styles.navigation}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={closeMobileSidebar}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link 
            href="/configuracoes" 
            className={styles.navItem}
            onClick={closeMobileSidebar}
          >
            <FiSettings size={20} />
            <span>Configurações</span>
          </Link>
          
          <button className={styles.navItem} onClick={handleLogoutConfirmation}>
            <FiLogOut size={20} />
            <span>Sair</span>
          </button>
        </div>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={confirmLogout}
          title="Sair da Plataforma"
          message="Tem certeza que deseja encerrar sua sessão e voltar para a tela de login?"
          type="warning"
          confirmText="Sim, Sair"
          cancelText="Permanecer"
        />
      </aside>
    </>
  );
}