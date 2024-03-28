// src/components/Dashboard/ActivityFeed.tsx

import React, { useState, useEffect } from "react";
import { getUserActivity } from "../../api/activityApi";

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const activityData = await getUserActivity();
      setActivities(activityData);
    };

    fetchActivity();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
      {activities.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="bg-white p-4 rounded-md shadow">
              <p className="text-gray-600">{activity.message}</p>
              <p className="text-sm text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;
