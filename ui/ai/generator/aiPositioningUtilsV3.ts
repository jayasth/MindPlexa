import { Node, Edge } from 'reactflow';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 150;

type LayoutType = 'mindmap' | 'tree' | 'flowchart';

interface CanvasSize {
  width: number;
  height: number;
}

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  layoutType: LayoutType,
  canvasSize: CanvasSize
): Node[] {
  switch (layoutType) {
    case 'mindmap':
      return applyMindmapLayout(nodes, edges, canvasSize);
    case 'tree':
      return applyTreeLayout(nodes, edges, canvasSize);
    case 'flowchart':
      return applyFlowchartLayout(nodes, edges, canvasSize);
    default:
      console.warn(`Unknown layout type: ${layoutType}. Using mindmap layout.`);
      return applyMindmapLayout(nodes, edges, canvasSize);
  }
}

function createHierarchy(nodes: Node[], edges: Edge[]): Map<string, string[]> {
  const hierarchy = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!hierarchy.has(edge.source)) {
      hierarchy.set(edge.source, []);
    }
    hierarchy.get(edge.source)!.push(edge.target);
  });
  return hierarchy;
}

function applyMindmapLayout(
  nodes: Node[],
  edges: Edge[],
  canvasSize: CanvasSize
): Node[] {
  const rootNode = nodes[0];
  rootNode.position = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2
  };

  const hierarchy = createHierarchy(nodes, edges);
  const angleStep = (2 * Math.PI) / (nodes.length - 1);

  function positionNode(
    nodeId: string,
    angle: number,
    distance: number,
    level: number
  ) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    node.position = {
      x: rootNode.position.x + Math.cos(angle) * distance,
      y: rootNode.position.y + Math.sin(angle) * distance
    };

    const children = hierarchy.get(nodeId) || [];
    const childAngleStep = angleStep / (children.length || 1);
    children.forEach((childId, index) => {
      const childAngle = angle - angleStep / 2 + childAngleStep * (index + 0.5);
      positionNode(childId, childAngle, distance + 200, level + 1);
    });
  }

  const rootChildren = hierarchy.get(rootNode.id) || [];
  rootChildren.forEach((childId, index) => {
    positionNode(childId, angleStep * index, 200, 1);
  });

  return nodes;
}

function applyTreeLayout(
  nodes: Node[],
  edges: Edge[],
  canvasSize: CanvasSize
): Node[] {
  const rootNode = nodes[0];
  rootNode.position = {
    x: canvasSize.width / 2,
    y: 50
  };

  const hierarchy = createHierarchy(nodes, edges);

  function positionNode(nodeId: string, x: number, y: number, level: number) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    node.position = { x, y };

    const children = hierarchy.get(nodeId) || [];
    const childrenWidth = children.length * (NODE_WIDTH + HORIZONTAL_SPACING);
    const startX = x - childrenWidth / 2 + NODE_WIDTH / 2;

    children.forEach((childId, index) => {
      const childX = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING);
      const childY = y + NODE_HEIGHT + VERTICAL_SPACING;
      positionNode(childId, childX, childY, level + 1);
    });
  }

  positionNode(rootNode.id, rootNode.position.x, rootNode.position.y, 0);

  return nodes;
}

function applyFlowchartLayout(
  nodes: Node[],
  edges: Edge[],
  canvasSize: CanvasSize
): Node[] {
  const levels = createLevels(nodes, edges);

  levels.forEach((levelNodes, level) => {
    const levelWidth = levelNodes.length * (NODE_WIDTH + HORIZONTAL_SPACING);
    const startX = (canvasSize.width - levelWidth) / 2 + NODE_WIDTH / 2;

    levelNodes.forEach((nodeId, index) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        node.position = {
          x: startX + index * (NODE_WIDTH + HORIZONTAL_SPACING),
          y: 50 + level * (NODE_HEIGHT + VERTICAL_SPACING)
        };
      }
    });
  });

  return nodes;
}

function createLevels(nodes: Node[], edges: Edge[]): string[][] {
  const hierarchy = createHierarchy(nodes, edges);
  const levels: string[][] = [];
  const visited = new Set<string>();

  function dfs(nodeId: string, level: number) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(nodeId);

    const children = hierarchy.get(nodeId) || [];
    children.forEach((childId) => dfs(childId, level + 1));
  }

  // Find the root node (node with no incoming edges)
  const rootNode = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  );
  if (rootNode) {
    dfs(rootNode.id, 0);
  }

  return levels;
}
