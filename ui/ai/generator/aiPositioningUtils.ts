import { Node, Edge } from 'reactflow';

export const optimizeAINodePositions = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edgeMap = new Map<string, string[]>();

  edges.forEach((edge) => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, []);
    }
    edgeMap.get(edge.source)!.push(edge.target);
  });

  const rootNode = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  );
  if (!rootNode) return nodes;

  const layoutNodes = (
    node: Node,
    x: number,
    y: number,
    level: number
  ): void => {
    const children = edgeMap.get(node.id) || [];
    const childCount = children.length;

    node.position = { x, y };

    if (childCount > 0) {
      const childSpacing = Math.min(200, canvasSize.width / (childCount + 1));
      const startX = x - (childSpacing * (childCount - 1)) / 2;

      children.forEach((childId, index) => {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          layoutNodes(
            childNode,
            startX + index * childSpacing,
            y + 150,
            level + 1
          );
        }
      });
    }
  };

  layoutNodes(rootNode, canvasSize.width / 2, 100, 0);

  return Array.from(nodeMap.values());
};
