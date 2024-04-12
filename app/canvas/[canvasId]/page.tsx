// app/canvas/[canvasId]/page.tsx

import { useState, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, Node, Edge } from 'reactflow';
import { createClient } from '@/utils/supabase/supabaseClient';
import { CustomNode } from '@/components/reactflow/custom-node';
import { Canvases } from '@/types/database/canvas';

type Canvas = Canvases['Row'];

interface PageProps {
  params: {
    canvasId: string;
  };
}

export default function CanvasPage({ params }: PageProps) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const fetchCanvas = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .eq('id', params.canvasId)
        .single();

      if (error) {
        console.error('Error fetching canvas:', error);
      } else {
        setCanvas(data as Canvas);
        setNodes(JSON.parse(data.configuration).nodes);
        setEdges(JSON.parse(data.configuration).edges);
      }
    };

    fetchCanvas();
  }, [params.canvasId]);

  const nodeTypes = {
    startEvent: CustomNode,
    endEvent: CustomNode,
    activity: CustomNode
  };

  if (!canvas) {
    return <div>Loading...</div>;
  }

  return (
    <ReactFlowProvider>
      <div className="canvas-container h-screen">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView />
      </div>
    </ReactFlowProvider>
  );
}
