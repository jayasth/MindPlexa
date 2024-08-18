import React from 'react';
import Link from 'next/link';
import {
  FaLayerGroup,
  FaChartBar,
  FaPlus,
  FaCog,
  FaUser,
  FaBell
} from 'react-icons/fa';
import { createClient } from '@/utils/supabase/supabaseServer';
import CanvasList from '@/ui/canvas/CanvasList';
import styles from './WorkspacePage.module.css';
import Button from '@/ui/Button/Button';

export default async function WorkspacePage() {
  const supabase = createClient();

  const { data: canvases, error: canvasesError } = await supabase
    .from('canvases')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (canvasesError) {
    console.error('Error fetching data:', canvasesError);
    return <div>Error loading workspace data</div>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Workspace Overview</h1>
      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FaLayerGroup className={styles.cardIcon} /> Recent Canvases
          </h2>
          <CanvasList canvases={canvases ?? []} />
          <Link href="/workspace/canvases" className={styles.link}>
            View all canvases
          </Link>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FaChartBar className={styles.cardIcon} /> Workspace Analytics
          </h2>
          <p className={styles.cardDescription}>
            Track your progress and productivity across canvases.
          </p>
          <Link href="/workspace/analytics">
            <Button variant="sleek">View Analytics</Button>
          </Link>
        </div>
      </div>
      <div className={styles.quickActions}>
        <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          <Link href="/canvasEditor/new">
            <Button
              variant="slim"
              className={`${styles.fullWidthButton} ${styles.primaryButton}`}
            >
              <FaPlus className="mr-2 text-xs" /> Create New Canvas
            </Button>
          </Link>
          <Link href="/workspace/profile">
            <Button
              variant="slim"
              className={`${styles.fullWidthButton} ${styles.secondaryButton}`}
            >
              <FaUser className="mr-2 text-xs" /> Edit Profile
            </Button>
          </Link>
          <Link href="/workspace/settings">
            <Button
              variant="slim"
              className={`${styles.fullWidthButton} ${styles.secondaryButton}`}
            >
              <FaCog className="mr-2 text-xs" /> Account Settings
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
