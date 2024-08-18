import React from 'react';
import Link from 'next/link';
import type { Tables } from 'types_db';
import { FaEdit } from 'react-icons/fa';

type Canvas = Tables<'canvases'>;

interface CanvasListProps {
  canvases: Canvas[];
}

const CanvasList: React.FC<CanvasListProps> = ({ canvases }) => {
  return (
    <ul className="space-y-2">
      {canvases.map((canvas) => (
        <li key={canvas.id} className="flex justify-between items-center">
          <Link
            href={`/canvasEditor/${canvas.id}`}
            className="text-blue-600 hover:underline"
          >
            {canvas.name}
          </Link>
          <span className="text-sm text-gray-500">
            {canvas.created_at
              ? new Date(canvas.created_at).toLocaleDateString()
              : 'N/A'}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default CanvasList;
