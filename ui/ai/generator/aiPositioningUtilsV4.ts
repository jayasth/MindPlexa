import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

type LayoutType = 'tree' | 'radial' | 'force' | 'mindmap' | 'timeline' | 'grid';

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: LayoutType
): Node[] => {
  console.log('Applying layout:', layoutType);

  if (nodes.length === 0) {
    console.warn('No nodes provided for layout');
    return [];
  }

  const nodesCopy = nodes.map((node) => ({
    ...node,
    position: node.position || { x: 0, y: 0 }
  }));

  try {
    let layoutedNodes: Node[];
    switch (layoutType) {
      case 'tree':
        layoutedNodes = applyTreeLayout(nodesCopy, edges, canvasSize);
        break;
      case 'radial':
        layoutedNodes = applyRadialLayout(nodesCopy, edges, canvasSize);
        break;
      case 'force':
        layoutedNodes = applyForceLayout(nodesCopy, edges, canvasSize);
        break;
      case 'mindmap':
        layoutedNodes = applyMindmapLayout(nodesCopy, canvasSize);
        break;
      case 'timeline':
        layoutedNodes = applyTimelineLayout(nodesCopy, canvasSize);
        break;
      case 'grid':
      default:
        layoutedNodes = applyGridLayout(nodesCopy, canvasSize);
        break;
    }

    if (!validateLayout(layoutedNodes, canvasSize)) {
      console.warn('Layout validation failed, falling back to grid layout');
      return applyGridLayout(nodesCopy, canvasSize);
    }

    return layoutedNodes;
  } catch (error) {
    console.error('Error applying layout:', error);
    return applyGridLayout(nodesCopy, canvasSize);
  }
};

const validateLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): boolean => {
  return nodes.every(
    (node) =>
      node.position &&
      isFinite(node.position.x) &&
      isFinite(node.position.y) &&
      node.position.x >= 0 &&
      node.position.x <= canvasSize.width &&
      node.position.y >= 0 &&
      node.position.y <= canvasSize.height
  );
};

const createHierarchy = (
  nodes: Node[],
  edges: Edge[]
): d3.HierarchyNode<Node> => {
  const idToNodeMap = new Map(nodes.map((node) => [node.id, node]));
  const childrenMap = new Map<string, Node[]>();

  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    const targetNode = idToNodeMap.get(edge.target);
    if (targetNode) {
      childrenMap.get(edge.source)!.push(targetNode);
    }
  });

  const rootNode = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  );
  if (!rootNode) {
    throw new Error('No root node found');
  }

  const buildHierarchy = (node: Node): d3.HierarchyNode<Node> => {
    const children = childrenMap.get(node.id) || [];
    return d3.hierarchy(node, (n) => childrenMap.get(n.id) || []);
  };

  return buildHierarchy(rootNode);
};

const applyTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  try {
    const hierarchy = createHierarchy(nodes, edges);

    const treeLayout = d3
      .tree<Node>()
      .size([canvasSize.width * 0.9, canvasSize.height * 0.9])
      .nodeSize([150, 200])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

    const root = treeLayout(hierarchy);

    return nodes.map((node) => {
      const layoutNode = root.find((d) => d.data.id === node.id);
      return {
        ...node,
        position: layoutNode
          ? {
              x: Math.max(0, Math.min(layoutNode.x, canvasSize.width)),
              y: Math.max(0, Math.min(layoutNode.y, canvasSize.height))
            }
          : node.position
      };
    });
  } catch (error) {
    console.error('Error in tree layout:', error);
    return applyGridLayout(nodes, canvasSize);
  }
};

const applyRadialLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  try {
    const hierarchy = createHierarchy(nodes, edges);

    const radialLayout = d3
      .tree<Node>()
      .size([2 * Math.PI, Math.min(canvasSize.width, canvasSize.height) / 2])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const root = radialLayout(hierarchy);

    return nodes.map((node) => {
      const layoutNode = root.find((d) => d.data.id === node.id);
      if (layoutNode) {
        const x = layoutNode.x * (180 / Math.PI) + canvasSize.width / 2;
        const y = layoutNode.y + canvasSize.height / 2;
        return { ...node, position: { x, y } };
      }
      return node;
    });
  } catch (error) {
    console.error('Error in radial layout:', error);
    return applyGridLayout(nodes, canvasSize);
  }
};

const applyForceLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  // TODO: Implement force layout
  console.warn('Force layout not implemented yet');
  return applyGridLayout(nodes, canvasSize);
};

const applyMindmapLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  // TODO: Implement mindmap layout
  console.warn('Mindmap layout not implemented yet');
  return applyGridLayout(nodes, canvasSize);
};

const applyTimelineLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  try {
    const nodeWidth = 200;
    const nodeHeight = 100;
    const verticalSpacing = 150;
    const horizontalSpacing = nodeWidth + 50;
    const maxNodesPerRow = Math.floor(canvasSize.width / horizontalSpacing);

    return nodes.map((node, index) => {
      const row = Math.floor(index / maxNodesPerRow);
      const col = index % maxNodesPerRow;
      return {
        ...node,
        position: {
          x: col * horizontalSpacing + nodeWidth / 2,
          y: row * verticalSpacing + nodeHeight / 2
        }
      };
    });
  } catch (error) {
    console.error('Error in timeline layout:', error);
    return applyGridLayout(nodes, canvasSize);
  }
};

const applyGridLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const cellWidth = canvasSize.width / cols;
  const cellHeight = canvasSize.height / Math.ceil(nodes.length / cols);

  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % cols) * cellWidth + cellWidth / 2,
      y: Math.floor(index / cols) * cellHeight + cellHeight / 2
    }
  }));
};
