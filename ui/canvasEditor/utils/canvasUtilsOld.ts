import type { Node, Edge } from 'reactflow';

export function applyNodeChanges(changes: any[], nodes: Node[]): Node[] {
  return nodes.map((node) => {
    const change = changes.find((c) => c.id === node.id);
    if (change) {
      const updatedStyle = { ...node.style, ...change.style };
      const updatedPosition = change.position || node.position;
      const updatedSize = {
        width: change.width !== undefined ? change.width : node.width || 0,
        height: change.height !== undefined ? change.height : node.height || 0
      };

      console.log(`canvasUtils: Applying changes to node ${node.id}:`, change);

      return {
        ...node,
        position: updatedPosition,
        data: { ...node.data, ...change.data },
        style: updatedStyle,
        width: updatedSize.width,
        height: updatedSize.height,
        positionAbsolute: change.positionAbsolute || node.positionAbsolute,
        selected:
          change.selected !== undefined ? change.selected : node.selected
      };
    }
    return node;
  });
}

export function applyEdgeChanges(changes: any[], edges: Edge[]): Edge[] {
  return edges.map((edge) => {
    const change = changes.find((c) => c.id === edge.id);
    if (change) {
      console.log(`canvasUtils: Applying changes to edge ${edge.id}:`, change);
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
