import { Node, Edge } from 'reactflow';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 150;

export function optimizeAINodePositions(
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] {
  const rootNode = nodes[0];
  rootNode.position = {
    x: canvasSize.width / 2 - NODE_WIDTH / 2,
    y: 50
  };

  const childrenMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });

  const positionNode = (
    nodeId: string,
    level: number,
    index: number,
    totalSiblings: number
  ) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const children = childrenMap.get(nodeId) || [];
    const centerX = canvasSize.width / 2;
    const levelWidth = totalSiblings * (NODE_WIDTH + HORIZONTAL_SPACING);
    const startX = centerX - levelWidth / 2 + NODE_WIDTH / 2;

    node.position = {
      x: startX + index * (NODE_WIDTH + HORIZONTAL_SPACING),
      y: 50 + level * (NODE_HEIGHT + VERTICAL_SPACING)
    };

    children.forEach((childId, childIndex) => {
      positionNode(childId, level + 1, childIndex, children.length);
    });
  };

  positionNode(rootNode.id, 0, 0, 1);

  return nodes;
}
