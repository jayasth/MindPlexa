//ui/canvasEditor/diagram.tsx
import React, { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState
} from 'reactflow';
import { nodeTypes, edgeTypes } from './nodeTypes'; // Import nodeTypes and edgeTypes
import { parseMermaidCode } from '@/utils/canvas/mermaid-utils';
import { Node } from '@/ui/canvasEditor/canvasEditorReducer'; // Correct import

interface DiagramProps {
  mermaidCode?: string;
  isComplete?: boolean;
  children?: React.ReactNode;
}

const Diagram: React.FC<DiagramProps> = ({
  mermaidCode = '',
  isComplete = false,
  children
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  useEffect(() => {
    async function parse() {
      const { nodes, edges } = await parseMermaidCode(mermaidCode);
      const adjustedNodes = nodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x || window.innerWidth / 2 - 150,
          y: node.position.y || window.innerHeight / 2 - 75
        }
      }));
      setNodes(adjustedNodes);
      setEdges(edges);
    }
    if (isComplete && mermaidCode) {
      parse();
    }
  }, [mermaidCode, isComplete]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes} // Use memoized edgeTypes here
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {children}
    </div>
  );
};

export default Diagram;
