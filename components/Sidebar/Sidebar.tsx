'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiGrid, FiFolderPlus, FiPackage, FiSettings, FiLogOut } from 'react-icons/fi';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  // Menu Items - Atualizado com rotas corretas
  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard/consultora',
      icon: FiGrid
    },
    {
      label: 'Produção',
      href: '/dashboard/producao',
      icon: FiFolderPlus
    },
    {
      label: 'Admin',
      href: '/dashboard/admin',
      icon: FiGrid
    },
    {
      label: 'Catálogo',
      href: '/catalogo',
      icon: FiPackage
    }
  ];

  const handleLogout = () => {
    const confirmed = confirm('Deseja realmente sair?');
    if (confirmed) {
      window.location.href = '/login';
    }
  };

  return (
    <aside className={styles.sidebar}>
      
      {/* Logo */}
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

      {/* Navegação Principal */}
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

      {/* Footer da Sidebar */}
      <div className={styles.sidebarFooter}>
        <Link href="/configuracoes" className={styles.navItem}>
          <FiSettings size={20} />
          <span>Configurações</span>
        </Link>
        
        <button className={styles.navItem} onClick={handleLogout} aria-label="Sair">
          <FiLogOut size={20} />
          <span>Sair</span>
        </button>
      </div>

    </aside>
  );
}