import React from 'react';
import Link from 'next/link';
import { FaThLarge, FaChartBar } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/supabaseServer';
import CanvasList from '@/ui/canvas/CanvasList';
import styles from './WorkspacePage.module.css';

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
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FaThLarge className={styles.cardIcon} /> Recent Canvases
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
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Track your progress and productivity across canvases.
          </p>
          <Link href="/workspace/analytics">
            <button className={styles.button}>View Analytics</button>
          </Link>
        </div>
      </div>
      <div className={styles.quickActions}>
        <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          <Link href="/canvasEditor/new">
            <button className={`${styles.fullWidthButton} ${styles.button}`}>
              Create New Canvas
            </button>
          </Link>
          <Link href="/workspace/settings">
            <button
              className={`${styles.fullWidthButton} bg-gray-500 text-white hover:bg-gray-600`}
            >
              Workspace Settings
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
