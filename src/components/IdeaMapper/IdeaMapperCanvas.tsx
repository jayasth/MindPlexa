// src/components/IdeaMapper/IdeaMapperCanvas.tsx
import React, { useCallback, useRef, useMemo } from "react";
import ReactFlow, { ReactFlowInstance, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import IdeaMapperCanvasInner from "./IdeaMapperCanvasInner";

const IdeaMapperCanvas: React.FC = () => {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const onLoad = useCallback((instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
  }, []);

  return (
    <ReactFlowProvider>
      <IdeaMapperCanvasInner
        onLoad={onLoad}
        reactFlowRef={reactFlowRef}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      />
    </ReactFlowProvider>
  );
};

export default IdeaMapperCanvas;
