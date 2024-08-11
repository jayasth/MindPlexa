import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

export type LayoutType = 'force' | 'radial' | 'tree';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

export const applyD3Layout = (
  nodes: Node[],
  edges: Edge[],
  layoutType: LayoutType,
  canvasSize: { width: number; height: number }
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
      const hierarchy = d3
        .stratify<Node>()
        .id((d: any) => d.id)
        .parentId((d: any) => edgesCopy.find((e) => e.target === d.id)?.source)(
        nodesCopy
      );

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
