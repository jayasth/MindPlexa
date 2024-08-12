import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: 'tree' | 'radial' | 'force' | 'mindmap' | 'timeline'
): Node[] => {
  console.log('Applying layout:', layoutType);

  const nodesCopy = nodes.map((node) => ({
    ...node,
    x: undefined,
    y: undefined
  }));
  const edgesCopy = edges.map((edge) => ({ ...edge }));

  switch (layoutType) {
    case 'tree':
      return applyTreeLayout(nodesCopy, edgesCopy, canvasSize);
    case 'radial':
      return applyRadialLayout(nodesCopy, edgesCopy, canvasSize);
    case 'force':
      return applyForceLayout(nodesCopy, edgesCopy, canvasSize);
    case 'mindmap':
      return applyMindmapLayout(nodesCopy, canvasSize);
    case 'timeline':
      return applyTimelineLayout(nodesCopy, canvasSize);
    default:
      console.warn(
        'Invalid layout type, falling back to force-directed layout'
      );
      return applyForceLayout(nodesCopy, edgesCopy, canvasSize);
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
    .nodeSize([100, 200])
    .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

  const root = treeLayout(hierarchy);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.id === node.id);
    return {
      ...node,
      position: { x: layoutNode?.x || 0, y: layoutNode?.y || 0 }
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
    .radial<Node>()
    .radius((d) => d.depth * 200)
    .size([2 * Math.PI, Math.min(canvasSize.width, canvasSize.height) / 2]);

  const root = radialLayout(hierarchy);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.id === node.id);
    const x = layoutNode
      ? (layoutNode.x * 180) / Math.PI + canvasSize.width / 2
      : 0;
    const y = layoutNode ? layoutNode.y + canvasSize.height / 2 : 0;
    return { ...node, position: { x, y } };
  });
};

const applyForceLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulation = d3
    .forceSimulation(nodes)
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

  simulation.tick(300);

  return nodes.map((node) => ({
    ...node,
    position: {
      x: Math.max(50, Math.min(node.x || 0, canvasSize.width - 50)),
      y: Math.max(50, Math.min(node.y || 0, canvasSize.height - 50))
    }
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
};
