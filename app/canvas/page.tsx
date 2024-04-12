// app/canvas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, addEdge, Node, Edge } from 'reactflow';
import { createClient } from '@/utils/supabase/supabaseClient';
import { CustomNode } from '@/components/reactflow/custom-node';
import { Canvases } from '@/types/database/canvas'; // Import the Canvas type

type Canvas = Canvases['Row']; // Type alias for convenience

export default function CanvasLibraryPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);

  useEffect(() => {
    const fetchCanvases = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('canvases').select('*');
      if (error) {
        console.error('Error fetching canvases:', error);
      } else {
        setCanvases(data as Canvas[]);
      }
    };

    fetchCanvases();
  }, []);

  const nodeTypes = {
    startEvent: CustomNode,
    endEvent: CustomNode,
    activity: CustomNode
  };

  return (
    <div>
      {canvases.map((canvas) => (
        <div key={canvas.id} className="canvas-container">
          <ReactFlowProvider>
            <ReactFlow
              nodes={JSON.parse(canvas.configuration).nodes.map((node) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: { label: node.label }
              }))}
              edges={JSON.parse(canvas.configuration).edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target
              }))}
              nodeTypes={nodeTypes}
            />
          </ReactFlowProvider>
        </div>
      ))}
    </div>
  );
}
