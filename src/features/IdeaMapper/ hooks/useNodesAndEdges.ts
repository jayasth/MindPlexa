import { useState, useCallback } from "react";
import { Node, Edge } from "reactflow";

export const useNodesAndEdges = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const addNode = useCallback((node: Node) => {
    setNodes((prevNodes) => [...prevNodes, node]);
  }, []);

  const addEdge = useCallback((edge: Edge) => {
    setEdges((prevEdges) => [...prevEdges, edge]);
  }, []);

  // Implement other operations like deleteNode, deleteEdge, etc.

  return { nodes, edges, addNode, addEdge };
};
