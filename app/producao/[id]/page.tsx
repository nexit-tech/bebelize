'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiCheckCircle } from 'react-icons/fi';
import Sidebar from '@/components/Sidebar/Sidebar';
import ProductionDetails from '@/components/ProductionDetails/ProductionDetails';
import TechnicalSpecs from '@/components/TechnicalSpecs/TechnicalSpecs';
import ProductionNotes from '@/components/ProductionNotes/ProductionNotes';
import Button from '@/components/Button/Button';
import styles from './producao-projeto.module.css';

export default function ProducaoProjetoPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  // Estados
  const [productionNotes, setProductionNotes] = useState('');

  // Dados Mockados do Projeto
  const mockProject = {
    id: projectId,
    name: 'Enxoval Completo - Sofia',
    clientName: 'Juliana Costa',
    createdAt: '08/10/2024',
    collection: 'Coleção Anjos',
    priority: 'urgent' as const
  };

  // Especificações Técnicas Mockadas
  const technicalSpecs = [
    {
      label: 'Tecido',
      value: 'Algodão Egípcio Premium',
      code: 'ALGOD-001'
    },
    {
      label: 'Cor Principal',
      value: 'Rosa Bebê',
      code: 'A68E80'
    },
    {
      label: 'Cor Secundária',
      value: 'Bege Claro',
      code: 'D4C5B9'
    },
    {
      label: 'Bordado - Nome',
      value: 'Sofia',
      code: ''
    },
    {
      label: 'Bordado - Estilo',
      value: 'Script (Cursiva) - Fonte: Great Vibes',
      code: 'FONT-003'
    },
    {
      label: 'Bordado - Cor da Linha',
      value: 'Dourado Suave',
      code: 'D4C29A'
    },
    {
      label: 'Quantidade de Peças',
      value: '12 peças (Kit Completo)',
      code: ''
    },
    {
      label: 'Prazo Estimado',
      value: '7 dias úteis',
      code: ''
    }
  ];

  // Handlers
  const handleDownloadPDF = () => {
    console.log('Baixando planta de produção:', projectId);
    alert('Download da Planta de Produção iniciado!');
  };

  const handleMarkAsComplete = () => {
    const confirmed = confirm('Confirmar que este projeto foi finalizado?');
    if (confirmed) {
      console.log('Projeto finalizado:', projectId);
      console.log('Notas de produção:', productionNotes);
      alert('Projeto marcado como finalizado com sucesso!');
      router.push('/dashboard/producao');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        
        {/* Header */}
        <header className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={handleGoBack}
            aria-label="Voltar"
          >
            <FiArrowLeft size={20} />
            <span>Voltar para Fila</span>
          </button>

          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={handleDownloadPDF}>
              <FiDownload size={18} />
              Baixar Planta (PDF)
            </Button>
            <Button variant="primary" onClick={handleMarkAsComplete}>
              <FiCheckCircle size={18} />
              Marcar como Finalizado
            </Button>
          </div>
        </header>

        {/* Detalhes do Projeto */}
        <div className={styles.card}>
          <ProductionDetails
            projectName={mockProject.name}
            clientName={mockProject.clientName}
            createdAt={mockProject.createdAt}
            collectionName={mockProject.collection}
            priority={mockProject.priority}
          />
        </div>

        {/* Layout em 2 Colunas */}
        <div className={styles.columnsLayout}>
          
          {/* Coluna Esquerda: Especificações Técnicas */}
          <div className={styles.columnLeft}>
            <div className={styles.card}>
              <TechnicalSpecs specifications={technicalSpecs} />
            </div>
          </div>

          {/* Coluna Direita: Notas de Produção */}
          <div className={styles.columnRight}>
            <div className={styles.card}>
              <ProductionNotes
                notes={productionNotes}
                onNotesChange={setProductionNotes}
              />
            </div>
          </div>

        </div>

        {/* Seção: Checklist de Verificação */}
        <div className={styles.card}>
          <div className={styles.checklistSection}>
            <h2 className={styles.checklistTitle}>Checklist de Verificação</h2>
            <p className={styles.checklistSubtitle}>
              Marque os itens conforme forem sendo verificados antes da finalização
            </p>

            <div className={styles.checklistItems}>
              
              <label className={styles.checklistItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checklistLabel}>
                  Tecido correto conforme especificação (código e qualidade)
                </span>
              </label>

              <label className={styles.checklistItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checklistLabel}>
                  Cores principais e secundárias conferidas
                </span>
              </label>

              <label className={styles.checklistItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checklistLabel}>
                  Nome bordado corretamente (ortografia e estilo)
                </span>
              </label>

              <label className={styles.checklistItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checklistLabel}>
                  Quantidade de peças completa
                </span>
              </label>

              <label className={styles.checklistItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checklistLabel}>
                  Acabamento e costuras verificados
                </span>
              </label>

              <label className={styles.checklistItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checklistLabel}>
                  Embalagem adequada e etiquetas aplicadas
                </span>
              </label>

            </div>
          </div>
        </div>

      </main>

    </div>
  );
}