// utils/mermaid/mermaid-utils.ts
import { Node, Edge, XYPosition } from 'reactflow';

interface MermaidNode {
  id: string;
  label: string;
  type: string;
}

interface MermaidEdge {
  id: string;
  source: string;
  target: string;
}

const parseMermaidCode = async (
  mermaidCode: string
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  // Implement the logic to parse the Mermaid code and generate nodes and edges
  const mermaidNodes: MermaidNode[] = [
    // Example node data
    { id: '1', label: 'Start', type: 'startEvent' },
    { id: '2', label: 'Do something', type: 'activity' },
    { id: '3', label: 'End', type: 'endEvent' }
  ];

  const mermaidEdges: MermaidEdge[] = [
    // Example edge data
    { id: '1-2', source: '1', target: '2' },
    { id: '2-3', source: '2', target: '3' }
  ];

  const nodes: Node[] = mermaidNodes.map((node, index) => ({
    id: node.id,
    type: node.type,
    position: { x: index * 200, y: 100 },
    data: { label: node.label }
  }));

  const edges: Edge[] = mermaidEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target
  }));

  return { nodes, edges };
};

export { parseMermaidCode };
