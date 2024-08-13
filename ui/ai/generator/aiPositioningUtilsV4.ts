import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

type LayoutType = 'tree' | 'radial' | 'force' | 'mindmap' | 'timeline';

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
      default:
        console.warn(
          'Invalid layout type, falling back to force-directed layout'
        );
        layoutedNodes = applyForceLayout(nodesCopy, edges, canvasSize);
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
  const rootNode = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  );
  if (!rootNode) throw new Error('No root node found');

  const hierarchy: { [key: string]: d3.HierarchyNode<Node> } = {};
  nodes.forEach((node) => {
    hierarchy[node.id] = d3.hierarchy(node);
  });

  edges.forEach((edge) => {
    const parent = hierarchy[edge.source];
    const child = hierarchy[edge.target];
    if (parent && child) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(child);
    }
  });

  return hierarchy[rootNode.id];
};

const applyTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  try {
    const root = createHierarchy(nodes, edges);
    const treeLayout = d3
      .tree<Node>()
      .size([canvasSize.width * 0.9, canvasSize.height * 0.9])
      .nodeSize([150, 200])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

    const treeData = treeLayout(root);

    return nodes.map((node) => {
      const treeNode = treeData.find((d) => d.data.id === node.id);
      return {
        ...node,
        position: treeNode
          ? {
              x: Math.max(0, Math.min(treeNode.x, canvasSize.width)),
              y: Math.max(0, Math.min(treeNode.y, canvasSize.height))
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
    const root = createHierarchy(nodes, edges);
    const radialLayout = d3
      .tree<Node>()
      .size([
        2 * Math.PI,
        Math.min(canvasSize.width, canvasSize.height) / 2 - 100
      ])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const radialData = radialLayout(root);

    return nodes.map((node) => {
      const radialNode = radialData.find((d) => d.data.id === node.id);
      if (radialNode) {
        const x = (radialNode.x * 180) / Math.PI;
        const y = radialNode.y;
        return {
          ...node,
          position: {
            x: Math.cos(x) * y + canvasSize.width / 2,
            y: Math.sin(x) * y + canvasSize.height / 2
          }
        };
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
  try {
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3
          .forceLink(edges)
          .id((d: any) => d.id)
          .distance(LINK_DISTANCE)
      )
      .force('charge', d3.forceManyBody().strength(FORCE_STRENGTH))
      .force('collision', d3.forceCollide().radius(COLLISION_RADIUS))
      .force(
        'center',
        d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2)
      )
      .stop();

    simulation.tick(300);

    return nodes.map((node) => ({
      ...node,
      position: {
        x: Math.max(50, Math.min((node as any).x || 0, canvasSize.width - 50)),
        y: Math.max(50, Math.min((node as any).y || 0, canvasSize.height - 50))
      }
    }));
  } catch (error) {
    console.error('Error in force layout:', error);
    return applyGridLayout(nodes, canvasSize);
  }
};

const applyMindmapLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  try {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const radius = Math.min(canvasSize.width, canvasSize.height) / 3;

    return nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...node, position: { x, y } };
    });
  } catch (error) {
    console.error('Error in mindmap layout:', error);
    return applyGridLayout(nodes, canvasSize);
  }
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

    return nodes.map((node, index) => {
      const row = Math.floor(
        index / Math.floor(canvasSize.width / horizontalSpacing)
      );
      const col = index % Math.floor(canvasSize.width / horizontalSpacing);
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
