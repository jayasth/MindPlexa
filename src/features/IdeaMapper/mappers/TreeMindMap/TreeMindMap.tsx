// src/features/IdeaMapper/mappers/TreeMindMap/TreeMindMap.tsx
import React, { useEffect, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowInstance } from "reactflow";
import ELK, { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk.bundled";
import TreeNode from "./TreeNode";
import TreeEdge from "./TreeEdge";

const TreeMindMap: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const initialNodes: Node[] = [
      {
        id: "node-1",
        type: "treeNode",
        data: { label: "Main Topic" },
        position: { x: 0, y: 0 },
      },
    ];

    const initialEdges: Edge[] = [];

    const elk = new ELK();
    const graph: ElkNode = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.spacing.nodeNode": "20",
        "elk.layered.spacing.nodeNodeBetweenLayers": "20",
      },
      children: initialNodes.map((node) => ({
        id: node.id,
        width: 100,
        height: 50,
      })),
      edges: initialEdges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };

    elk.layout(graph).then((graphLayout: ElkNode) => {
      const layoutNodes: Node[] = (graphLayout.children || []).map(
        (node: ElkNode) => {
          const initialNode = initialNodes.find((n) => n.id === node.id);
          return {
            ...initialNode,
            id: initialNode?.id || "",
            data: initialNode?.data || { label: "Default label" }, // provide a default value
            position: {
              x: node.x || 0,
              y: node.y || 0,
            },
          };
        }
      );

      const layoutEdges: Edge[] = (graphLayout.edges || []).map(
        (edge: ElkExtendedEdge) => ({
          ...initialEdges.find((e) => e.id === edge.id),
          id: edge.id,
          source: edge.sources[0],
          target: edge.targets[0],
        })
      );

      setNodes(layoutNodes);
      setEdges(layoutEdges);
    });
  }, []);

  const nodeTypes = {
    treeNode: TreeNode,
  };

  const edgeTypes = {
    treeEdge: TreeEdge,
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    />
  );
};

export default TreeMindMap;
