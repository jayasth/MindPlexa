import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

export const applyD3Layout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: 'force' | 'radial' | 'tree'
): Node[] => {
  // Create a deep copy of nodes and edges
  const nodesCopy = nodes.map((node) => ({
    ...node,
    x: undefined,
    y: undefined
  }));
  const edgesCopy = edges.map((edge) => ({ ...edge }));

  const simulation = d3.forceSimulation(nodesCopy);

  const linkForce = d3
    .forceLink(edgesCopy)
    .id((d: any) => d.id)
    .distance(LINK_DISTANCE);

  simulation
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(FORCE_STRENGTH))
    .force('collision', d3.forceCollide().radius(COLLISION_RADIUS))
    .force(
      'center',
      d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2)
    );

  if (
    layoutType !== 'force' &&
    layoutType !== 'radial' &&
    layoutType !== 'tree'
  ) {
    console.warn('Invalid layout type, falling back to force-directed layout');
    layoutType = 'force';
  }

  switch (layoutType) {
    case 'force':
      // Force-directed layout is already set up
      break;
    case 'radial':
      simulation
        .force(
          'r',
          d3.forceRadial(
            Math.min(canvasSize.width, canvasSize.height) / 3,
            canvasSize.width / 2,
            canvasSize.height / 2
          )
        )
        .force('charge', d3.forceManyBody().strength(FORCE_STRENGTH * 2));
      break;
    case 'tree':
      // Find the root node (node with no incoming edges)
      const rootId = nodes.find(
        (node) => !edges.some((edge) => edge.target === node.id)
      )?.id;

      if (!rootId) {
        console.warn(
          'No root node found, falling back to force-directed layout'
        );
        // Fall back to force-directed layout
        break;
      }

      const hierarchy = d3
        .stratify<Node>()
        .id((d: any) => d.id)
        .parentId((d: any) => {
          const parentEdge = edges.find((e) => e.target === d.id);
          return parentEdge ? parentEdge.source : null;
        })(nodes);

      const treeLayout = d3
        .tree<Node>()
        .size([canvasSize.width - 200, canvasSize.height - 200])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2));

      const root = treeLayout(hierarchy);

      root.each((d: any) => {
        const node = nodesCopy.find((n) => n.id === d.id);
        if (node) {
          node.x = d.x + 100;
          node.y = d.y + 100;
        }
      });

      return nodesCopy.map((node) => ({
        ...node,
        position: { x: node.x || 0, y: node.y || 0 }
      }));
  }

  simulation.stop();
  simulation.tick(300);

  return nodesCopy.map((node) => ({
    ...node,
    position: { x: node.x || 0, y: node.y || 0 }
  }));
};
