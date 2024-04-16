import React from 'react';
import Link from 'next/link';

export default function CanvasesPage() {
  // Fetch the list of canvases from your database or API
  const canvases = [
    { id: 'canvas-1', title: 'Canvas 1' },
    { id: 'canvas-2', title: 'Canvas 2' },
    { id: 'canvas-3', title: 'Canvas 3' }
  ];

  return (
    <main className="p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Canvases</h1>
      <div className="grid gap-6">
        {canvases.map((canvas) => (
          <Link key={canvas.id} href={`/workspace/canvases/${canvas.id}`}>
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-lg font-bold">{canvas.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
