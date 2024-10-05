'use client';

import React, { Suspense } from 'react';
import AnalyticsOverview from '@/ui/analytics/AnalyticsOverview';
import CanvasUsageChart from '@/ui/analytics/CanvasUsageChart';
import NodeTypeDistribution from '@/ui/analytics/NodeTypeDistribution';
import ProjectProgress from '@/ui/analytics/ProjectProgress';
import Card from '@/ui/Card/Card';
import styles from './Analytics.module.css';

function AnalyticsContent() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Workspace Analytics</h1>
      <div className={styles.grid}>
        <Card title="Overview" className={styles.card}>
          <AnalyticsOverview />
        </Card>
        <Card title="Canvas Usage" className={styles.card}>
          <CanvasUsageChart />
        </Card>
        <Card title="Node Type Distribution" className={styles.card}>
          <NodeTypeDistribution />
        </Card>
        <Card title="Project Progress" className={styles.card}>
          <ProjectProgress />
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
