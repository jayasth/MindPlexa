import React from 'react';
import styles from './CalendarToolbar.module.css';
import { Views } from 'react-big-calendar';
import { FaCalendarAlt, FaCalendarWeek, FaCalendarDay } from 'react-icons/fa';
import Dropdown from '@/ui/dropdown/Dropdown';

interface CalendarToolbarProps {
  view: string;
  defaultView: string;
  onViewChange: (view: string) => void;
  onDefaultViewChange: (view: string) => void;
  textColor: string;
  backgroundColor: string;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  view,
  defaultView,
  onViewChange,
  onDefaultViewChange,
  textColor,
  backgroundColor
}) => {
  const handleViewClick = (newView: string) => {
    onViewChange(newView);
  };

  return (
    <div
      className={styles.toolbar}
      style={{ color: textColor, backgroundColor }}
    >
      <Dropdown
        value={defaultView}
        onChange={onDefaultViewChange}
        variant="slim"
        style={{ color: textColor, backgroundColor: 'transparent' }}
        className={styles.viewDropdown}
      >
        <option value="month">Month</option>
        <option value="week">Week</option>
        <option value="day">Day</option>
      </Dropdown>
      <button
        className={`${styles.viewButton} ${
          view === 'month' ? styles.active : ''
        }`}
        onClick={() => handleViewClick('month')}
        title="Month View"
      >
        <FaCalendarAlt />
      </button>
      <button
        className={`${styles.viewButton} ${
          view === 'week' ? styles.active : ''
        }`}
        onClick={() => handleViewClick('week')}
        title="Week View"
      >
        <FaCalendarWeek />
      </button>
      <button
        className={`${styles.viewButton} ${
          view === 'day' ? styles.active : ''
        }`}
        onClick={() => handleViewClick('day')}
        title="Day View"
      >
        <FaCalendarDay />
      </button>
    </div>
  );
};

export default CalendarToolbar;
