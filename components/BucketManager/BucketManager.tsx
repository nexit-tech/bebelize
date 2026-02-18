'use client';

import { useState, useEffect, useRef } from 'react';
import { storageService } from '@/lib/supabase/storage.service';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { FiFolder, FiFolderPlus, FiUpload, FiImage, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import styles from './BucketManager.module.css';

interface StorageItem {
  name: string;
  id: string | null;
}

export default function BucketManager() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [contents, setContents] = useState<StorageItem[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pathString = currentPath.join('/');

  const fetchContents = async () => {
    setIsLoadingContents(true);
    try {
      const data = await storageService.listContents(pathString);
      const filtered = data.filter((item: any) => item.name !== '.emptyFolderPlaceholder' && item.name !== '.keep');
      const sorted = filtered.sort((a: any, b: any) => {
        if (a.id === null && b.id !== null) return -1;
        if (a.id !== null && b.id === null) return 1;
        return a.name.localeCompare(b.name);
      });
      setContents(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingContents(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [pathString]);

  const formatPathSegment = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = formatPathSegment(newFolderName);
    if (!formattedName) return;

    const newPath = pathString ? `${pathString}/${formattedName}` : formattedName;

    try {
      setIsUploading(true);
      await storageService.createFolder(newPath);
      setNewFolderName('');
      await fetchContents();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar pasta.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (currentPath.length === 0) {
      alert('Selecione ou crie uma Coleção/Item antes de enviar imagens.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name.toLowerCase().endsWith('.png')) {
          alert(`O arquivo ${file.name} não é um PNG válido.`);
          continue;
        }
        
        const filePath = `${pathString}/${file.name}`;
        await storageService.uploadImage(filePath, file);
      }
      alert('Upload concluído com sucesso!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchContents();
    } catch (error) {
      console.error(error);
      alert('Erro ao fazer upload dos arquivos.');
    } finally {
      setIsUploading(false);
    }
  };

  const navigateTo = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  const navigateToCrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div className={styles.container}>
      <div className={styles.browserSection}>
        <div className={styles.breadcrumb}>
          <button 
            className={styles.crumbBtn} 
            onClick={() => setCurrentPath([])}
            disabled={isUploading}
          >
            bebelize-images
          </button>
          {currentPath.map((crumb, index) => (
            <div key={index} className={styles.crumbWrapper}>
              <FiChevronRight className={styles.crumbIcon} />
              <button 
                className={styles.crumbBtn}
                onClick={() => navigateToCrumb(index)}
                disabled={isUploading}
              >
                {crumb}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.explorer}>
          <div className={styles.explorerHeader}>
            {currentPath.length > 0 ? (
              <button onClick={navigateUp} className={styles.backBtn} disabled={isUploading}>
                <FiArrowLeft /> Voltar
              </button>
            ) : (
              <div className={styles.spacer}></div>
            )}
            <span className={styles.currentPathLabel}>
              {currentPath.length === 0 
                ? 'Diretório Raiz (Coleções)' 
                : `Destino do Upload: /${pathString}`}
            </span>
          </div>

          <div className={styles.explorerGrid}>
            {isLoadingContents ? (
              <div className={styles.loadingState}>Carregando pastas e arquivos...</div>
            ) : contents.length === 0 ? (
              <div className={styles.emptyState}>Nenhum conteúdo encontrado nesta pasta.</div>
            ) : (
              contents.map((item, idx) => {
                const isFolder = item.id === null;
                return (
                  <div 
                    key={idx} 
                    className={`${styles.itemCard} ${isFolder ? styles.folderCard : styles.fileCard}`}
                    onClick={() => isFolder && !isUploading ? navigateTo(item.name) : null}
                  >
                    {isFolder ? <FiFolder className={styles.itemIconFolder} /> : <FiImage className={styles.itemIconFile} />}
                    <span className={styles.itemName} title={item.name}>{item.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.actionsBar}>
          <form onSubmit={handleCreateFolder} className={styles.createFolderForm}>
            <div className={styles.inputWrapper}>
              <Input
                type="text"
                id="newFolder"
                label=""
                placeholder="Nome da nova subpasta..."
                value={newFolderName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUploading || !newFolderName.trim()}
              variant="secondary"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FiFolderPlus size={18} />
                {isUploading ? 'Criando...' : 'Criar Pasta'}
              </div>
            </Button>
          </form>

          <div className={styles.uploadWrapper}>
            <input
              type="file"
              accept=".png"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
              className={styles.hiddenInput}
              id="bucket-file-upload"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading || currentPath.length === 0}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FiUpload size={18} />
                {isUploading ? 'Enviando...' : 'Enviar .PNGs Aqui'}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}