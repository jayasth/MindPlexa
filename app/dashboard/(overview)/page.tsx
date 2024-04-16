import React, { Suspense } from 'react';
import ProjectSummary from '@/ui/dashboard/ProjectSummary';
import TaskOverview from '@/ui/dashboard/TaskOverview';
import CollaborationTools from '@/ui/dashboard/CollaborationTools';
import DashboardSkeleton from '@/ui/dashboard/DashboardSkeleton';

export default function Dashboard() {
  return (
    <main className="p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">
        MindPlexa Dashboard
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<DashboardSkeleton />}>
          <ProjectSummary />
          <TaskOverview />
          <CollaborationTools />
        </Suspense>
      </div>
    </main>
  );
}
