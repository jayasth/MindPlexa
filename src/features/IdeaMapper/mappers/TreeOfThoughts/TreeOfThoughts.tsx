// src/features/IdeaMapper/mappers/TreeOfThoughts/TreeOfThoughts.tsx
import React, { useEffect } from "react";
import ReactFlow, { Node, Edge, useReactFlow } from "reactflow";
import { ElkNode } from "elkjs/lib/elk.bundled";
import { elk } from "../../../../lib/elk";
import TreeNode from "./TreeNode";
import TreeEdge from "./TreeEdge";

interface TreeOfThoughtsProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes?: any;
  edgeTypes?: any;
}

const TreeOfThoughts: React.FC<TreeOfThoughtsProps> = ({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
}) => {
  const { setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    const layout = async () => {
      const graph: ElkNode = {
        id: "root",
        layoutOptions: {
          "elk.algorithm": "layered",
          "elk.direction": "RIGHT",
          "elk.spacing.nodeNode": "50",
          "elk.layered.spacing.nodeNodeBetweenLayers": "50",
        },
        children: nodes.map((node) => ({
          id: node.id,
          width: 100,
          height: 50,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      const newGraph = await elk.layout(graph);

      if (newGraph.children && newGraph.edges) {
        const newNodes = newGraph.children
          .map((node) => {
            const originalNode = nodes.find((n) => n.id === node.id);
            return {
              ...originalNode,
              position: {
                x: node.x ?? 0,
                y: node.y ?? 0,
              },
            };
          })
          .filter(
            (node): node is Node =>
              !!node.position.x && !!node.position.y && !!node.id
          );

        const newEdges = newGraph.edges
          .map((edge) => {
            const originalEdge = edges.find((e) => e.id === edge.id);
            return {
              ...originalEdge,
              source: edge.sources[0],
              target: edge.targets[0],
              id:
                originalEdge?.id ??
                `edge-${edge.sources[0]}-${edge.targets[0]}`,
            };
          })
          .filter(
            (edge): edge is Edge => !!edge.id && !!edge.source && !!edge.target
          );

        setNodes(newNodes);
        setEdges(newEdges);
      }
    };

    layout();
  }, [nodes, edges, setNodes, setEdges]);

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

export default TreeOfThoughts;
