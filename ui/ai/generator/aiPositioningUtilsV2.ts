import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: string
): Node[] => {
  console.log('Applying layout:', layoutType);

  if (layoutType.includes('-')) {
    // Handle hybrid layouts
    const [primaryLayout, secondaryLayout] = layoutType.split('-');
    const primaryNodes = applyLayoutByType(
      nodes.slice(0, nodes.length / 2),
      edges,
      canvasSize,
      primaryLayout
    );
    const secondaryNodes = applyLayoutByType(
      nodes.slice(nodes.length / 2),
      edges,
      canvasSize,
      secondaryLayout
    );
    return [...primaryNodes, ...secondaryNodes];
  } else {
    return applyLayoutByType(nodes, edges, canvasSize, layoutType);
  }
};

const applyLayoutByType = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: string
): Node[] => {
  switch (layoutType) {
    case 'tree':
      return applyTreeLayout(nodes, edges, canvasSize);
    case 'radial':
      return applyRadialLayout(nodes, edges, canvasSize);
    case 'force':
      return applyForceLayout(nodes, edges, canvasSize);
    case 'mindmap':
      return applyMindmapLayout(nodes, edges, canvasSize);
    case 'timeline':
      return applyTimelineLayout(nodes, canvasSize);
    default:
      console.warn(
        'Invalid layout type, falling back to force-directed layout'
      );
      return applyForceLayout(nodes, edges, canvasSize);
  }
};

const applyTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const hierarchy = d3
    .stratify<Node>()
    .id((d: any) => d.id)
    .parentId((d: any) => {
      const parentEdge = edges.find((e) => e.target === d.id);
      return parentEdge ? parentEdge.source : null;
    })(nodes);

  const treeLayout = d3
    .tree<Node>()
    .size([canvasSize.width * 0.9, canvasSize.height * 0.9])
    .nodeSize([150, 200])
    .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

  const root = treeLayout(hierarchy);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.id === node.id);
    return {
      ...node,
      position: layoutNode
        ? {
            x: layoutNode.x + canvasSize.width * 0.05,
            y: layoutNode.y + canvasSize.height * 0.05
          }
        : { x: 0, y: 0 }
    };
  });
};

const applyRadialLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const hierarchy = d3
    .stratify<Node>()
    .id((d: any) => d.id)
    .parentId((d: any) => {
      const parentEdge = edges.find((e) => e.target === d.id);
      return parentEdge ? parentEdge.source : null;
    })(nodes);

  const radialLayout = d3
    .tree<Node>()
    .size([
      2 * Math.PI,
      Math.min(canvasSize.width, canvasSize.height) / 2 - 100
    ])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

  const root = radialLayout(hierarchy);

  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.id === node.id);
    if (layoutNode) {
      const x = centerX + layoutNode.y * Math.cos(layoutNode.x - Math.PI / 2);
      const y = centerY + layoutNode.y * Math.sin(layoutNode.x - Math.PI / 2);
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
        .distance(LINK_DISTANCE)
    )
    .force('charge', d3.forceManyBody().strength(FORCE_STRENGTH))
    .force('collision', d3.forceCollide().radius(COLLISION_RADIUS))
    .force(
      'center',
      d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2)
    );

  simulation.stop();
  simulation.tick(300);

  return nodes.map((node: any) => ({
    ...node,
    position: {
      x: Math.max(50, Math.min(node.x || 0, canvasSize.width - 50)),
      y: Math.max(50, Math.min(node.y || 0, canvasSize.height - 50))
    }
  }));
};

const applyMindmapLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  // Use the same logic as applyRadialLayout for consistency
  return applyRadialLayout(nodes, edges, canvasSize);
};

const applyTimelineLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const timelineY = canvasSize.height / 2;
  const nodeSpacing = canvasSize.width / (nodes.length + 1);

  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index + 1) * nodeSpacing,
      y: timelineY
    }
  }));
};
