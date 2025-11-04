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
      
      <div className={styles.brandPanel}>
        <Image 
          src="/bebelizelogo.jpg" 
          alt="Logo Bebelize" 
          width={120}
          height={120}
          className={styles.logo}
          priority
        />
        <h1 className={styles.brandTitle}>Bebelize</h1>
        <p className={styles.brandSubtitle}>
          Plataforma de Gestão de Enxovais Personalizados
        </p>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <h2 className={styles.formTitle}>Acesse sua conta</h2>
          <p className={styles.formSubtitle}>
            Utilize suas credenciais para entrar no sistema.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            
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

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" variant="primary" fullWidth size="large">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}