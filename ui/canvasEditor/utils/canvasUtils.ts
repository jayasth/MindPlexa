import type { Node, Edge } from 'reactflow';

export function applyNodeChanges(changes: any[], nodes: Node[]): Node[] {
  return nodes.map((node) => {
    const change = changes.find((c) => c.id === node.id);
    if (change) {
      const updatedStyle = { ...node.style, ...change.style };
      const updatedPosition = change.position || node.position;
      const updatedSize = {
        width: change.width || node.width,
        height: change.height || node.height
      };

      return {
        ...node,
        position: updatedPosition,
        data: { ...node.data, ...change.data },
        style: updatedStyle,
        width: updatedSize.width,
        height: updatedSize.height,
        positionAbsolute: change.positionAbsolute || node.positionAbsolute
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

export const handleDownload = (state: { nodes: Node[]; edges: Edge[] }) => {
  try {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(state)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'canvas.json');
    link.click();
  } catch (error) {
    console.error('Failed to download the canvas:', error);
  }
};

export const handleShare = (state: { nodes: Node[]; edges: Edge[] }) => {
  try {
    console.log('Sharing canvas:', state);
    // Implement sharing logic here, possibly using an API or local sharing options
  } catch (error) {
    console.error('Failed to share the canvas:', error);
  }
};
