import React from 'react';
import styles from './CalendarToolbar.module.css';
import { Views } from 'react-big-calendar';
import { FaCalendarAlt, FaCalendarWeek, FaCalendarDay } from 'react-icons/fa';

interface CalendarToolbarProps {
  view: string;
  defaultView: string;
  onViewChange: (view: string) => void;
  onDefaultViewChange: (view: string) => void;
  textColor: string;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  view,
  defaultView,
  onViewChange,
  onDefaultViewChange,
  textColor
}) => {
  const handleViewClick = (newView: string) => {
    onViewChange(newView);
  };

  return (
    <div className={styles.toolbar} style={{ color: textColor }}>
      <select
        value={defaultView}
        onChange={(e) => onDefaultViewChange(e.target.value)}
        style={{ color: textColor }}
      >
        <option value="month">Month</option>
        <option value="week">Week</option>
        <option value="day">Day</option>
      </select>
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
