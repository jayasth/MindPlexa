'use client';
import React, { useState } from 'react';
import WorkspaceSidebar from '@/ui/workspace/WorkspaceSidebar';
import styles from '@/app/workspace/WorkspaceLayout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.container}>
      <WorkspaceSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div
        className={`${styles.content} ${isSidebarOpen ? styles.contentWithSidebar : styles.contentWithoutSidebar}`}
      >
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}
