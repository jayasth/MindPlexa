import { Node, Edge } from 'reactflow';

export const optimizeAINodePositions = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  // Find the root node (node with no incoming edges)
  const rootNodeId = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  )?.id;

  if (!rootNodeId) return nodes;

  // Create a map of nodes for quick access
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // Create a map of child nodes for each parent
  const childrenMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });

  // Recursive function to position nodes
  const positionNode = (
    nodeId: string,
    x: number,
    y: number,
    level: number,
    index: number,
    siblings: number
  ) => {
    const node = nodeMap.get(nodeId)!;
    node.position = { x, y };

    const children = childrenMap.get(nodeId) || [];
    const childSpacing = Math.min(
      200,
      canvasSize.width / (children.length + 1)
    );
    const startX = x - (childSpacing * (children.length - 1)) / 2;

    children.forEach((childId, childIndex) => {
      positionNode(
        childId,
        startX + childIndex * childSpacing,
        y + 150,
        level + 1,
        childIndex,
        children.length
      );
    });
  };

  // Start positioning from the root node
  positionNode(rootNodeId, centerX, 100, 0, 0, 1);

  return Array.from(nodeMap.values());
};
