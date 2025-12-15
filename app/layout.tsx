import type { Metadata } from 'next';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Bebelize - Gestão de Enxovais Personalizados',
  description: 'Plataforma para gerenciamento de vendas e produção de enxovais',
  icons: {
    icon: '/bebelizelogo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={styles.layout}>{children}</body>
    </html>
  );
}