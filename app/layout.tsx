import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import './globals.css';
import styles from './layout.module.css';

const montserrat = Montserrat({ subsets: ['latin'] });

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
      <body className={`${montserrat.className} ${styles.layout}`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}