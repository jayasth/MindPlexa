// src/components/Dashboard/DashboardOverview.tsx
import React from "react";
import Link from "next/link";
import { FiMap, FiMessageCircle, FiStar } from "react-icons/fi";

const DashboardOverview: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/agents/IdeaMapper">
          <div className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md">
            <FiMap className="text-2xl mb-2" />
            <h3 className="text-lg font-medium">IdeaMapper</h3>
            <p className="text-gray-600">
              Create visual mind maps and brainstorm ideas.
            </p>
          </div>
        </Link>
        <Link href="/agents/BrainstormBuddy">
          <div className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md">
            <FiMessageCircle className="text-2xl mb-2" />
            <h3 className="text-lg font-medium">BrainstormBuddy</h3>
            <p className="text-gray-600">
              Engage in interactive brainstorming sessions.
            </p>
          </div>
        </Link>
        <Link href="/agents/IdeaVault">
          <div className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md">
            <FiStar className="text-2xl mb-2" />
            <h3 className="text-lg font-medium">IdeaVault</h3>
            <p className="text-gray-600">
              Store and manage your ideas securely.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview;
