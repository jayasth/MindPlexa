import type { Node, Edge } from 'reactflow';

export function applyNodeChanges(changes: any[], nodes: Node[]): Node[] {
  return nodes.map((node) => {
    const change = changes.find((c) => c.id === node.id);
    if (change) {
      const updatedStyle = { ...node.style, ...change.style };

      return {
        ...node,
        position: change.position || node.position,
        data: { ...node.data, ...change.data },
        style: updatedStyle
      };
    }
    return node;
  });
}

export function applyEdgeChanges(changes: any[], edges: Edge[]): Edge[] {
  return edges.map((edge) => {
    const change = changes.find((c) => c.id === edge.id);
    if (change) {
      return {
        ...edge,
        source: change.source || edge.source,
        target: change.target || edge.target,
        style: { ...edge.style, ...change.style }
      };
    }
    return edge;
  });
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
