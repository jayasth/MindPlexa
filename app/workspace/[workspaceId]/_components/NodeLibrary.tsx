'use client';

import { Tables } from '@/types_db';

type Node = Tables<'nodes'>;

interface NodeLibraryProps {
  nodes: Node[];
}

export default function NodeLibrary({ nodes }: NodeLibraryProps) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">Node Library</h3>
      {/* Add node library implementation */}
      <ul>
        {nodes.map((node) => (
          <li key={node.id}>{node.name}</li>
        ))}
      </ul>
    </div>
  );
}
