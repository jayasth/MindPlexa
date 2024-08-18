import React from 'react';
import {
  FaProjectDiagram,
  FaClipboardList,
  FaCalendar,
  FaStickyNote
} from 'react-icons/fa';
import styles from './AnalyticsOverview.module.css';

const AnalyticsOverview = () => {
  // Replace with actual data fetching logic
  const stats = {
    totalProjects: 10,
    totalTasks: 50,
    upcomingEvents: 5,
    totalNotes: 100
  };

  return (
    <div className={styles.container}>
      <div className={styles.stat}>
        <FaProjectDiagram className={styles.icon} />
        <div>
          <h3 className={styles.label}>Total Projects</h3>
          <p className={styles.value}>{stats.totalProjects}</p>
        </div>
      </div>
      <div className={styles.stat}>
        <FaClipboardList className={styles.icon} />
        <div>
          <h3 className={styles.label}>Total Tasks</h3>
          <p className={styles.value}>{stats.totalTasks}</p>
        </div>
      </div>
      <div className={styles.stat}>
        <FaCalendar className={styles.icon} />
        <div>
          <h3 className={styles.label}>Upcoming Events</h3>
          <p className={styles.value}>{stats.upcomingEvents}</p>
        </div>
      </div>
      <div className={styles.stat}>
        <FaStickyNote className={styles.icon} />
        <div>
          <h3 className={styles.label}>Total Notes</h3>
          <p className={styles.value}>{stats.totalNotes}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
