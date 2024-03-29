// src/components/Dashboard/ActivityFeed.tsx
import React from "react";
import { FiZap, FiUsers } from "react-icons/fi";

const ActivityFeed: React.FC = () => {
  // Fetch activity data from the API or use dummy data for now
  const activities = [
    {
      id: 1,
      type: "idea",
      title: "New Idea Created",
      description: "You created a new idea: 'Innovative Product Design'",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "session",
      title: "Brainstorming Session Completed",
      description:
        "You completed the brainstorming session: 'Marketing Strategies'",
      timestamp: "1 day ago",
    },
    // Add more activity items
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {/* Render an icon based on the activity type */}
            {activity.type === "idea" && (
              <FiZap className="text-yellow-500" size={24} />
            )}
            {activity.type === "session" && (
              <FiUsers className="text-blue-500" size={24} />
            )}
          </div>
          <div>
            <p className="font-semibold">{activity.title}</p>
            <p className="text-gray-600">{activity.description}</p>
            <p className="text-sm text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
