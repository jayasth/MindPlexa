import type { Node, Edge } from 'reactflow';

export function applyNodeChanges(changes: any, nodes: Node[]): Node[] {
  // Implement logic to apply changes to nodes
  return nodes; // return updated nodes
}

export function applyEdgeChanges(changes: any, edges: Edge[]): Edge[] {
  // Implement logic to apply changes to edges
  return edges; // return updated edges
}

export const handleDownload = (state: any) => {
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'canvas.json';
  link.click();
};

// Function to handle sharing the canvas
export const handleShare = (state: any) => {
  console.log('Sharing canvas:', state);
  // Add your sharing logic here
};
