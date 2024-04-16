'use client';
import React, { useState } from 'react';
import WorkspaceSidebar from '@/ui/workspace/WorkspaceSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <WorkspaceSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div
        className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-12' : 'ml-4'}`}
      >
        <button
          className="md:hidden fixed top-4 left-4 z-10 text-gray-600 hover:text-gray-800"
          onClick={toggleSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
