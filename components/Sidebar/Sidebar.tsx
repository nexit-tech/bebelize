'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiPackage, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/hooks';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();

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

  const handleLogout = () => {
    const confirmed = confirm('Deseja realmente sair?');
    if (confirmed) {
      logout();
      router.push('/login');
    }
  };

  return (
    <aside className={styles.sidebar}>
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
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/configuracoes" className={styles.navItem}>
          <FiSettings size={20} />
          <span>Configurações</span>
        </Link>
        
        <button className={styles.navItem} onClick={handleLogout}>
          <FiLogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}