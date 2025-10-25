'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock } from 'react-icons/fi';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import styles from './login.module.css';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login realizado:', { email, password });
    // Navegação mockada para dashboard
    // router.push('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/bebelizelogo.jpg" 
              alt="Logo Bebelize" 
              width={120}
              height={120}
              className={styles.logo}
              priority
            />
          </div>
          <p className={styles.subtitle}>Gestão de Enxovais Personalizados</p>
        </div>

        {/* Formulário */}
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Campo Email */}
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <FiMail size={20} />
            </div>
            <Input
              type="email"
              id="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo Senha */}
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <FiLock size={20} />
            </div>
            <Input
              type="password"
              id="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Link Esqueci Senha */}
          <div className={styles.forgotPassword}>
            <a href="#" className={styles.link}>
              Esqueci minha senha
            </a>
          </div>

          {/* Botão Entrar */}
          <Button type="submit" variant="primary" fullWidth>
            Entrar
          </Button>

        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Plataforma exclusiva para funcionários da Bebelize
          </p>
        </div>

      </div>
    </div>
  );
}