// src/features/IdeaMapper/components/IdeaMapperCanvasInner.tsx
import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  addEdge,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
interface IdeaMapperCanvasInnerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  nodeTypes: any;
  edgeTypes: any;
}

const IdeaMapperCanvasInner: React.FC<IdeaMapperCanvasInnerProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
}) => {
  const { project, fitView } = useReactFlow();

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      onNodesChange(nodes.filter((node) => node.id !== nodeId));
      onEdgesChange(
        edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [nodes, edges, onNodesChange, onEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      onEdgesChange([...edges, { ...connection, type: "custom" }]);
    },
    [edges, onEdgesChange]
  );

  const onPaneClick = useCallback(() => {
    fitView();
  }, [fitView]);

  const onDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode: Node = {
        id: `node-${nodes.length + 1}`,
        type: "custom",
        position,
        data: { label: "New Node" },
      };
      onNodesChange([...nodes, newNode]);
    },
    [nodes, onNodesChange, project]
  );

  const onInit = useCallback(() => {
    fitView();
  }, [fitView]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onDoubleClick={onDoubleClick}
        nodeTypes={{
          ...nodeTypes,
          custom: (props) => <CustomNode {...props} onDelete={onDeleteNode} />,
        }}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="top-right"
        onInit={onInit}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default IdeaMapperCanvasInner;
