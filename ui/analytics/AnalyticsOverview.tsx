import React from 'react';
import { useEffect, useState } from 'react';
import {
  FaProjectDiagram,
  FaClipboardList,
  FaNetworkWired
} from 'react-icons/fa';
import Card from '@/ui/Card/Card';
import styles from './AnalyticsOverview.module.css';
import { createClient } from '@/utils/supabase/supabaseClient';

const AnalyticsOverview = () => {
  const [totalCanvases, setTotalCanvases] = useState(0);
  const [totalNodes, setTotalNodes] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);

  useEffect(() => {
    const fetchOverviewData = async () => {
      const supabase = createClient();

      const { count: canvasCount } = await supabase
        .from('canvases')
        .select('*', { count: 'exact', head: true });

      const { count: nodeCount } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true });

      // Assuming 'active' projects are canvases updated in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeProjectCount } = await supabase
        .from('canvases')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      setTotalCanvases(canvasCount || 0);
      setTotalNodes(nodeCount || 0);
      setActiveProjects(activeProjectCount || 0);
    };

    fetchOverviewData();
  }, []);

  const statItems = [
    {
      icon: FaProjectDiagram,
      label: 'Total Canvases',
      value: totalCanvases
    },
    { icon: FaClipboardList, label: 'Total Nodes', value: totalNodes },
    { icon: FaNetworkWired, label: 'Active Projects', value: activeProjects }
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
