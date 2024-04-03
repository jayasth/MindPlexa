import React from "react";
import Sidebar from "./Sidebar";
import ActivityFeed from "./ActivityFeed";
import InsightsWidget from "./InsightsWidget";
import SearchBar from "../SearchBar";
import useTheme from "../../shared/hooks/useTheme";

const DashboardOverview: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="flex">
      <div className={`w-64 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <Sidebar />
      </div>
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <SearchBar />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className={`p-6 rounded-lg shadow ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityFeed />
          </div>
          <div
            className={`p-6 rounded-lg shadow ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Insights</h2>
            <InsightsWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
