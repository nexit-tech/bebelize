import React from 'react';
import { FiFilter, FiUsers } from 'react-icons/fi';
import { usersData } from '@/data';
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

  const consultants = usersData.filter(u => u.role === 'consultora' && u.active);

  return (
    <div className={styles.filterBarContainer}>
      <SearchBar 
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Buscar por nome do projeto, cliente ou consultora..."
      />

      <div className={styles.filtersRow}>
        <div className={styles.filterContainer}>
          <FiFilter size={18} className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="negociacao">Em Negociação</option>
            <option value="aprovado">Aprovado</option>
            <option value="producao">Em Produção</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className={styles.filterContainer}>
          <FiUsers size={18} className={styles.filterIcon} />
          <select 
            className={styles.filterSelect}
            value={filterConsultant}
            onChange={(e) => onFilterConsultantChange(e.target.value)}
          >
            <option value="todos">Todas as Consultoras</option>
            {consultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}