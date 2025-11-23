'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock } from 'react-icons/fi';
import Image from 'next/image';
import { useAuth } from '@/hooks';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);

    if (user) {
      if (user.role === 'consultora') {
        router.push('/dashboard/consultora');
      } else if (user.role === 'atelier') {
        router.push('/dashboard/atelier');
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin');
      }
    } else {
      setError('E-mail ou senha incorretos');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
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

        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          
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
              autoComplete="off"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" fullWidth>
            Entrar
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Plataforma exclusiva para funcionários da Bebelize
          </p>
        </div>
      </div>
    </div>
  );
}