import React from 'react';
import {
  FaProjectDiagram,
  FaClipboardList,
  FaCalendar,
  FaStickyNote
} from 'react-icons/fa';
import Card from '@/ui/Card/Card';
import styles from './AnalyticsOverview.module.css';

const AnalyticsOverview = () => {
  // Replace with actual data fetching logic
  const stats = {
    totalProjects: 10,
    totalTasks: 50,
    upcomingEvents: 5,
    totalNotes: 100
  };

  const statItems = [
    {
      icon: FaProjectDiagram,
      label: 'Total Projects',
      value: stats.totalProjects
    },
    { icon: FaClipboardList, label: 'Total Tasks', value: stats.totalTasks },
    { icon: FaCalendar, label: 'Upcoming Events', value: stats.upcomingEvents },
    { icon: FaStickyNote, label: 'Total Notes', value: stats.totalNotes }
  ];

  return (
    <Card title="Overview" className={styles.overviewCard}>
      <div className={styles.statsGrid}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.stat}>
            <item.icon className={styles.icon} />
            <div>
              <h3 className={styles.label}>{item.label}</h3>
              <p className={styles.value}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AnalyticsOverview;
