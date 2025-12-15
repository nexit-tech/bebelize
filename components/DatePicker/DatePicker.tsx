'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  id,
  required = false,
  placeholder = 'dd/mm/aaaa'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      setViewDate(new Date(year, month - 1, day));
    }
  }, [value]);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const handleDaySelect = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    onChange(dateString);
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateString = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === currentDateString;
      
      const today = new Date();
      const isToday = today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={(e) => handleDaySelect(day, e)}
          className={`${styles.dayButton} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthName = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.container} ref={containerRef}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper} onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          id={id}
          className={styles.dateInput}
          value={formatDateDisplay(value)}
          placeholder={placeholder}
          readOnly
          required={required}
        />
        <FiCalendar size={18} className={styles.calendarIcon} />
      </div>

      {isOpen && (
        <div className={styles.calendarPopup}>
          <div className={styles.header}>
            <button 
              type="button" 
              className={styles.navButton} 
              onClick={(e) => { e.preventDefault(); changeMonth(-1); }}
            >
              <FiChevronLeft size={18} />
            </button>
            <span className={styles.currentMonth}>{monthName}</span>
            <button 
              type="button" 
              className={styles.navButton} 
              onClick={(e) => { e.preventDefault(); changeMonth(1); }}
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          <div className={styles.weekDays}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
              <span key={index} className={styles.weekDay}>{day}</span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
}