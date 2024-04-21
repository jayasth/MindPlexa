import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
  useReactFlow,
  Background,
  Controls,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { parseMermaidCode } from '@/utils/canvas/mermaid-utils';
import { nodeTypes, edgeTypes } from './nodeTypes'; // Ensure these are defined to handle different node and edge types

interface DiagramProps {
  mermaidCode?: string;
}

const Diagram: React.FC<DiagramProps> = ({ mermaidCode = '' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport } = useReactFlow();

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  useEffect(() => {
    async function parse() {
      const { nodes, edges } = await parseMermaidCode(mermaidCode);
      setNodes(
        nodes.map((node) => ({
          ...node,
          data: {
            ...node,
            label: node.type // Assuming you want to display the type as label
          },
          position: {
            x: node.position.x || window.innerWidth / 2 - 150,
            y: node.position.y || window.innerHeight / 2 - 75
          }
        }))
      );
      setEdges(edges);
    }
    if (mermaidCode) {
      parse();
    }
  }, [mermaidCode, setNodes, setEdges]);

  const onConnect = (params: Connection) =>
    setEdges((eds) => addEdge(params, eds));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={memoizedNodeTypes}
      edgeTypes={memoizedEdgeTypes}
      fitView
    >
      <Controls />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

export default Diagram;
