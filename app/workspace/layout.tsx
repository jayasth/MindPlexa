'use client';
import React, { useState } from 'react';
import WorkspaceSidebar from '@/ui/workspace/WorkspaceSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-light-background dark:bg-dark-background">
      <WorkspaceSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}
      >
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
