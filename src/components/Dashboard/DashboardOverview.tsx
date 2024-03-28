// src/components/Dashboard/DashboardOverview.tsx
import React from "react";
import ActivityFeed from "./ActivityFeed";
import InsightsWidget from "./InsightsWidget";

const DashboardOverview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActivityFeed />
        <InsightsWidget />
      </div>
    </div>
  );
};

export default DashboardOverview;
