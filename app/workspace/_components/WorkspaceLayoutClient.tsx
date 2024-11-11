'use client';

import React, { useState } from 'react';
import WorkspaceSidebar from '@/ui/workspace/WorkspaceSidebar';
import FeedbackButton from '@/components/FeedbackButton/FeedbackButton';

export default function WorkspaceLayoutClient({
  children
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <WorkspaceSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div
        className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-12' : 'ml-4'
        }`}
      >
        <button
          className="md:hidden fixed top-4 left-4 z-10 text-gray-600 hover:text-gray-800"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '<<' : '>>'}
        </button>
        {children}
        <FeedbackButton />
      </div>
    </div>
  );
}
