import React, { useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  useReactFlow,
  ReactFlowInstance,
  Connection,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

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
  const reactFlowInstance = useReactFlow();

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.fitView();
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      onEdgesChange([...edges, { ...connection, type: "custom" }]);
    },
    [edges, onEdgesChange]
  );

  const onPaneClick = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        attributionPosition="top-right"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default IdeaMapperCanvasInner;
