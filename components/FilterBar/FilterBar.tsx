import React from 'react';
import { FiFilter, FiUsers } from 'react-icons/fi';
import SearchBar from '../SearchBar/SearchBar';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterConsultant: string;
  onFilterConsultantChange: (consultant: string) => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterConsultant,
  onFilterConsultantChange
}: FilterBarProps) {

  // Consultoras mockadas
  const consultants = [
    { value: 'todos', label: 'Todas as Consultoras' },
    { value: 'ana', label: 'Ana Paula Silva' },
    { value: 'carla', label: 'Carla Mendes' },
    { value: 'juliana', label: 'Juliana Costa' },
    { value: 'beatriz', label: 'Beatriz Santos' }
  ];

  return (
    <div className={styles.filterBarContainer}>
      
      {/* Barra de Busca */}
      <SearchBar 
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar por nome do projeto, cliente ou consultora..."
      />

      {/* Filtros */}
      <div className={styles.filtersRow}>
        
        {/* Filtro: Status */}
        <div className={styles.filterContainer}>
          <FiFilter size={18} className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="todos">Todos os Status</option>
            <option value="negociacao">Em Negociação</option>
            <option value="aprovado">Aprovado</option>
            <option value="producao">Em Produção</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Filtro: Consultora */}
        <div className={styles.filterContainer}>
          <FiUsers size={18} className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
            value={filterConsultant}
            onChange={(e) => onFilterConsultantChange(e.target.value)}
            aria-label="Filtrar por consultora"
          >
            {consultants.map((consultant) => (
              <option key={consultant.value} value={consultant.value}>
                {consultant.label}
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
}