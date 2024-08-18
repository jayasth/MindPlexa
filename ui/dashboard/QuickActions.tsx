import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    { label: 'Create Project', href: '/workspace/projects/new' },
    { label: 'New Canvas', href: '/workspace/canvases/new' },
    { label: 'Add Task', href: '/workspace/tasks/new' },
    { label: 'Invite Team Member', href: '/dashboard/invite' }
  ];

  return (
    <div className="bg-white shadow-sm p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
