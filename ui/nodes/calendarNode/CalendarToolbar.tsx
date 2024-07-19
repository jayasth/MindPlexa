import React from 'react';
import styles from './CalendarToolbar.module.css';
import {
  FaCalendarAlt,
  FaCalendarWeek,
  FaCalendarDay,
  FaChevronLeft,
  FaChevronRight,
  FaList
} from 'react-icons/fa';
import Dropdown from '@/ui/dropdown/Dropdown';

interface CalendarToolbarProps {
  view: string;
  defaultView: string;
  onViewChange: (view: string) => void;
  onDefaultViewChange: (view: string) => void;
  textColor: string;
  backgroundColor: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  currentDate: Date;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  view,
  defaultView,
  onViewChange,
  onDefaultViewChange,
  textColor,
  backgroundColor,
  onNavigate,
  currentDate
}) => {
  const handleViewClick = (newView: string) => {
    onViewChange(newView);
  };

  return (
    <div
      className={styles.toolbar}
      style={{ color: textColor, backgroundColor }}
    >
      <div className={styles.navButtons}>
        <button onClick={() => onNavigate('PREV')} className={styles.navButton}>
          <FaChevronLeft />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className={styles.navButton}
        >
          Today
        </button>
        <button onClick={() => onNavigate('NEXT')} className={styles.navButton}>
          <FaChevronRight />
        </button>
      </div>
      <div className={styles.currentDate}>
        {currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}
      </div>
      <div className={styles.viewButtons}>
        <button
          className={`${styles.viewButton} ${view === 'month' ? styles.active : ''}`}
          onClick={() => handleViewClick('month')}
          title="Month View"
        >
          <FaCalendarAlt />
        </button>
        <button
          className={`${styles.viewButton} ${view === 'week' ? styles.active : ''}`}
          onClick={() => handleViewClick('week')}
          title="Week View"
        >
          <FaCalendarWeek />
        </button>
        <button
          className={`${styles.viewButton} ${view === 'day' ? styles.active : ''}`}
          onClick={() => handleViewClick('day')}
          title="Day View"
        >
          <FaCalendarDay />
        </button>
        <button
          className={`${styles.viewButton} ${view === 'agenda' ? styles.active : ''}`}
          onClick={() => handleViewClick('agenda')}
          title="Agenda View"
        >
          <FaList />
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
