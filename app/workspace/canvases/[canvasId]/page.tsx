import React from 'react';
import CanvasEditor from '@/ui/workspace/CanvasEditor';
import AIAssistance from '@/ui/workspace/AIAssistance';
import Toolbar from '@/ui/workspace/Toolbar';

export default function CanvasPage({
  params
}: {
  params: { canvasId: string };
}) {
  const { canvasId } = params;

  // Fetch the canvas data based on the canvasId from your database or API
  const canvasData = {
    id: canvasId,
    title: 'Canvas Title'
    // Add other canvas data properties
  };

  return (
    <main className="flex h-full">
      <div className="w-64 bg-gray-100 p-4">
        <Toolbar />
      </div>
      <div className="flex-1 p-4">
        <CanvasEditor canvasData={canvasData} />
      </div>
      <div className="w-64 bg-gray-100 p-4">
        <AIAssistance />
      </div>
    </main>
  );
}
