// app/canvas/new/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from '@/components/reactflow/custom-node';
import { createClient } from '@/utils/supabase/supabaseClient';
import { Canvases } from '@/types/database/canvas';
import Diagram from '@/components/reactflow/diagram';
import { parseMermaidCode } from '@/utils/mermaid/mermaid-utils';

type Canvas = Canvases['Row'];

export default function NewCanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [mermaidCode, setMermaidCode] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [mermaidNodes, setMermaidNodes] = useState([]);
  const [mermaidEdges, setMermaidEdges] = useState([]);

  const onConnect = useCallback(
    (params) => setEdges((edges) => addEdge(params, edges)),
    []
  );

  const nodeTypes = {
    startEvent: CustomNode,
    endEvent: CustomNode,
    activity: CustomNode
  };

  const handleSave = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('canvases').insert({
      configuration: JSON.stringify({ nodes, edges })
    });

    if (error) {
      console.error('Error saving canvas:', error);
    } else {
      setCanvas(data[0]);
    }
  };

  const handleMermaidCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMermaidCode(e.target.value);
    setIsComplete(false);
  };

  const handleGenerateFromMermaid = () => {
    setIsComplete(true);
  };

  useEffect(() => {
    const generateFromMermaid = async () => {
      if (isComplete && mermaidCode) {
        const { nodes, edges } = await parseMermaidCode(mermaidCode);
        setMermaidNodes(nodes);
        setMermaidEdges(edges);
      }
    };

    generateFromMermaid();
  }, [isComplete, mermaidCode]);

  return (
    <ReactFlowProvider>
      <div className="canvas-container h-screen">
        <input
          type="text"
          value={mermaidCode}
          onChange={handleMermaidCodeChange}
          placeholder="Enter Mermaid code"
        />
        <button onClick={handleGenerateFromMermaid}>
          Generate from Mermaid
        </button>
        <Diagram
          nodes={mermaidNodes}
          edges={mermaidEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
        <button onClick={handleSave}>Save Canvas</button>
      </div>
    </ReactFlowProvider>
  );
}
