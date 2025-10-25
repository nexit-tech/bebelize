import React, { useState } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import styles from './StatusSelector.module.css';

interface StatusOption {
  value: 'negociacao' | 'aprovado' | 'producao' | 'finalizado' | 'cancelado';
  label: string;
  color: string;
}

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export default function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Opções de Status
  const statusOptions: StatusOption[] = [
    { value: 'negociacao', label: 'Em Negociação', color: '#D4C29A' },
    { value: 'aprovado', label: 'Aprovado', color: '#A3B59F' },
    { value: 'producao', label: 'Em Produção', color: '#B0C4DE' },
    { value: 'finalizado', label: 'Finalizado', color: '#A3B59F' },
    { value: 'cancelado', label: 'Cancelado', color: '#D9A6A0' }
  ];

  // Encontra o status atual
  const currentStatusObj = statusOptions.find(s => s.value === currentStatus);

  // Handlers
  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.statusSelectorContainer}>
      <label className={styles.label}>Status do Projeto</label>
      
      <div className={styles.dropdown}>
        <button
          className={styles.dropdownButton}
          onClick={toggleDropdown}
          aria-label="Selecionar status"
          aria-expanded={isOpen}
        >
          <div className={styles.currentStatus}>
            <div 
              className={styles.statusIndicator} 
              style={{ backgroundColor: currentStatusObj?.color }}
            />
            <span className={styles.statusLabel}>{currentStatusObj?.label}</span>
          </div>
          <FiChevronDown 
            size={20} 
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {isOpen && (
          <div className={styles.dropdownMenu}>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                className={`${styles.dropdownItem} ${currentStatus === status.value ? styles.active : ''}`}
                onClick={() => handleStatusSelect(status.value)}
              >
                <div className={styles.statusOption}>
                  <div 
                    className={styles.statusIndicator} 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className={styles.statusLabel}>{status.label}</span>
                </div>
                {currentStatus === status.value && (
                  <FiCheck size={18} className={styles.checkIcon} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}