import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

type LayoutType = 'tree' | 'radial' | 'force' | 'mindmap' | 'timeline';

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: LayoutType
): Node[] => {
  switch (layoutType) {
    case 'tree':
      return applyTreeLayout(nodes, edges, canvasSize);
    case 'radial':
      return applyRadialLayout(nodes, edges, canvasSize);
    case 'force':
      return applyForceLayout(nodes, edges, canvasSize);
    case 'mindmap':
      return applyMindmapLayout(nodes, canvasSize);
    case 'timeline':
      return applyTimelineLayout(nodes, canvasSize);
    default:
      console.warn('Invalid layout type, falling back to tree layout');
      return applyTreeLayout(nodes, edges, canvasSize);
  }
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
  const hierarchy = createHierarchy(nodes, edges);
  const treeLayout = d3
    .tree<Node>()
    .size([canvasSize.width * 0.9, canvasSize.height * 0.9]);

  const root = treeLayout(hierarchy);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    return layoutNode
      ? { ...node, position: { x: layoutNode.x, y: layoutNode.y } }
      : node;
  });
};

const applyRadialLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const hierarchy = createHierarchy(nodes, edges);
  const radialLayout = d3
    .tree<Node>()
    .size([2 * Math.PI, Math.min(canvasSize.width, canvasSize.height) / 2]);

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
};

const applyForceLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulation = d3
    .forceSimulation(nodes as d3.SimulationNodeDatum[])
    .force(
      'link',
      d3
        .forceLink(edges)
        .id((d: any) => d.id)
        .distance(100)
    )
    .force('charge', d3.forceManyBody().strength(-1000))
    .force(
      'center',
      d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2)
    )
    .stop();

  for (let i = 0; i < 300; ++i) simulation.tick();

  return nodes.map((node) => ({
    ...node,
    position: { x: (node as any).x, y: (node as any).y }
  }));
};

const applyMindmapLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;
  const radius = Math.min(canvasSize.width, canvasSize.height) / 3;

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { ...node, position: { x, y } };
  });
};

const applyTimelineLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
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
};
