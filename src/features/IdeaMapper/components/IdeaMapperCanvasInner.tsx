// src/features/IdeaMapper/components/IdeaMapperCanvasInner.tsx
import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  useReactFlow,
  ReactFlowInstance,
  OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import { realtimeClient } from "../../../utils/supabaseClient";

interface IdeaMapperCanvasInnerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  nodeTypes: any;
  edgeTypes: any;
  mindmapId: string;
  userId: string;
}

const IdeaMapperCanvasInner: React.FC<IdeaMapperCanvasInnerProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
  mindmapId,
  userId,
}) => {
  const reactFlowInstance = useReactFlow();
  const { project } = reactFlowInstance;

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.fitView();
  }, []);

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
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

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

  // Memoize nodeTypes
  const memoizedNodeTypes = useMemo(
    () => ({
      ...nodeTypes,
      custom: (props: any) => <CustomNode {...props} onDelete={onDeleteNode} />,
    }),
    [nodeTypes, onDeleteNode]
  );

  // Memoize edgeTypes
  const memoizedEdgeTypes = useMemo(() => edgeTypes, [edgeTypes]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    // Handle node selection change
  }, []);

  React.useEffect(() => {
    console.log("Mindmap ID:", mindmapId);
    console.log("User ID:", userId);

    const channel = realtimeClient.channel(`mindmaps:${mindmapId}`);

    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mindmaps",
          filter: `id=eq.${mindmapId}`,
        },
        (payload: any) => {
          const updatedMindmap = payload.new;
          if (updatedMindmap.user_id !== userId) {
            onNodesChange(updatedMindmap.nodes);
            onEdgesChange(updatedMindmap.edges);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      channel.unsubscribe();
    };
  }, [mindmapId, userId, onNodesChange, onEdgesChange]);

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
        onSelectionChange={onSelectionChange}
        nodeTypes={memoizedNodeTypes} // Use memoizedNodeTypes here
        edgeTypes={memoizedEdgeTypes} // Use memoizedEdgeTypes here
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
