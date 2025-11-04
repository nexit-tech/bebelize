import React from 'react';
import { FiSearch } from 'react-icons/fi';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Buscar...' 
}: SearchBarProps) {
  return (
    <div className={styles.searchContainer}>
      <FiSearch className={styles.searchIcon} size={20} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}