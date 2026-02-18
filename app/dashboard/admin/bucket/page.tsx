'use client';

import Sidebar from '@/components/Sidebar/Sidebar';
import BucketManager from '@/components/BucketManager/BucketManager';
import styles from './bucket.module.css';

export default function BucketPage() {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Gerenciador do Bucket</h1>
              <p className={styles.subtitle}>
                Navegue pelas pastas, crie novas coleções ou itens e faça upload de imagens (.png). Imagens enviadas com o mesmo nome de um arquivo existente irão substituí-lo (sobrepor).
              </p>
            </div>
          </div>
        </header>

        <BucketManager />
      </main>
    </div>
  );
}