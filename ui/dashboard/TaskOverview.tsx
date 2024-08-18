import React from 'react';
import Link from 'next/link';

export default function TaskOverview() {
  // Fetch task data here or pass it as props
  const tasks = [
    { id: 1, title: 'Complete project proposal', status: 'In Progress' },
    { id: 2, title: 'Review client feedback', status: 'Pending' },
    { id: 3, title: 'Update documentation', status: 'Completed' }
  ];

  return (
    <div className="bg-white shadow-sm p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4">Task Overview</h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex justify-between items-center">
            <span>{task.title}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                task.status === 'Completed'
                  ? 'bg-green-200 text-green-800'
                  : task.status === 'In Progress'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-red-200 text-red-800'
              }`}
            >
              {task.status}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/workspace/tasks"
        className="mt-4 inline-block text-blue-600 hover:underline"
      >
        View all tasks
      </Link>
    </div>
  );
}
