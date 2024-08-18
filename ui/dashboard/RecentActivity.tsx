import React from 'react';

export default function RecentActivity() {
  // Fetch recent activity data here or pass it as props
  const activities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'created a new project',
      time: '2 hours ago'
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'completed a task',
      time: '4 hours ago'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'commented on Project A',
      time: 'Yesterday'
    }
  ];

  return (
    <div className="bg-white shadow-sm p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
      <ul className="space-y-2">
        {activities.map((activity) => (
          <li key={activity.id} className="text-sm">
            <span className="font-medium">{activity.user}</span>{' '}
            {activity.action}
            <span className="text-gray-500 ml-2">{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
