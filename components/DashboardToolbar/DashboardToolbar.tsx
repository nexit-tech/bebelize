import React from 'react';
import FilterBar from '../FilterBar/FilterBar';
import SearchBar from '../SearchBar/SearchBar';
import styles from './DashboardToolbar.module.css';

interface DashboardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterPriority: string;
  onFilterPriorityChange: (priority: string) => void;
}

export default function DashboardToolbar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange,
}: DashboardToolbarProps) {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.searchWrapper}>
        <SearchBar 
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Buscar por nome do projeto ou cliente..."
        />
      </div>

      <div className={styles.filterWrapper}>
        <FilterBar
          searchQuery={searchQuery} // Apenas para satisfazer a prop type, mas não é usado internamente pelo FilterBar desta forma
          onSearchChange={onSearchChange} // O FilterBar irá ignorar esta prop, pois já temos a SearchBar
          filterStatus={filterStatus}
          onFilterStatusChange={onFilterStatusChange}
          filterPriority={filterPriority}
          onFilterPriorityChange={onFilterPriorityChange}
          showConsultantFilter={false} // Mantém o filtro de consultor oculto por enquanto
          filterConsultant={""} 
          onFilterConsultantChange={() => {}} 
        />
      </div>
    </div>
  );
}