// src/components/Dashboard/DashboardOverview.tsx
import React from "react";
import Link from "next/link";
import ActivityFeed from "./ActivityFeed";
import InsightsWidget from "./InsightsWidget";
import SearchBar from "../SearchBar";

const DashboardOverview: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SearchBar />
        <Link href="/account-settings">
          <span className="text-blue-500 hover:underline cursor-pointer">
            Account Settings
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ActivityFeed />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Insights</h2>
          <InsightsWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
