import React, { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState
} from 'reactflow';
import { CustomNode } from './custom-node';
import { parseMermaidCode } from '@/utils/canvas/mermaid-utils';
import { Node } from '@/ui/canvasEditor/canvasEditorReducer'; // Correct import

interface DiagramProps {
  mermaidCode?: string;
  isComplete?: boolean;
}

const Diagram: React.FC<DiagramProps> = ({
  mermaidCode = '',
  isComplete = false
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    async function parse() {
      const { nodes, edges } = await parseMermaidCode(mermaidCode);
      setNodes(nodes);
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

  const onLoad = useCallback((reactFlowInstance) => {
    reactFlowInstance.fitView();
  }, []);

  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode // Define custom nodes here if required
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onLoad={onLoad}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background color="#aaa" gap={16} />
      <Controls />
    </ReactFlow>
  );
};

export default Diagram;
