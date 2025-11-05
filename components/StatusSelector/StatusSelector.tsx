import React, { useState } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { ProjectStatus } from '@/types';
import { getStatusLabel, getStatusColor } from '@/utils';
import styles from './StatusSelector.module.css';

interface StatusSelectorProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

const statusOptions: { value: ProjectStatus, label: string, color: string }[] = [
  { value: 'rascunho', label: getStatusLabel('rascunho'), color: getStatusColor('rascunho') },
  { value: 'negociacao', label: getStatusLabel('negociacao'), color: getStatusColor('negociacao') },
  { value: 'aprovado', label: getStatusLabel('aprovado'), color: getStatusColor('aprovado') },
  { value: 'producao', label: getStatusLabel('producao'), color: getStatusColor('producao') },
  { value: 'finalizado', label: getStatusLabel('finalizado'), color: getStatusColor('finalizado') },
  { value: 'cancelado', label: getStatusLabel('cancelado'), color: getStatusColor('cancelado') }
];

export default function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentStatusObj = statusOptions.find(s => s.value === currentStatus);

  const handleStatusSelect = (status: ProjectStatus) => {
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