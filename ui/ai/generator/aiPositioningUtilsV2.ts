import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

const FORCE_STRENGTH = -1000;
const LINK_DISTANCE = 200;
const COLLISION_RADIUS = 100;

export const applyD3Layout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: 'tree' | 'radial' | 'force' | 'mindmap' | 'timeline'
): Node[] => {
  console.log('Applying layout:', layoutType);

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
      console.log('Applying force-directed layout');
      break;
    case 'radial':
      console.log('Applying radial layout');
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
      console.log('Applying enhanced tree layout');
      const rootId = nodes.find(
        (node) => !edges.some((edge) => edge.target === node.id)
      )?.id;

      if (!rootId) {
        console.warn(
          'No root node found, falling back to force-directed layout'
        );
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
        .size([canvasSize.width, canvasSize.height])
        .nodeSize([100, 200])
        .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5));

      const root = treeLayout(hierarchy);

      root.each((d: any) => {
        const node = nodesCopy.find((n) => n.id === d.id);
        if (node) {
          node.x = d.x;
          node.y = d.y;
        }
      });

      return nodesCopy.map((node) => ({
        ...node,
        position: { x: node.x || 0, y: node.y || 0 }
      }));
    case 'mindmap':
      console.log('Applying simplified mindmap layout');
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const radius = Math.min(canvasSize.width, canvasSize.height) / 3;

      return nodes.map((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        return {
          ...node,
          position: { x, y }
        };
      });
    case 'timeline':
      console.log('Applying timeline layout');
      const timelineForce = d3.forceY(canvasSize.height / 2).strength(1);
      simulation
        .force('timeline', timelineForce)
        .force(
          'x',
          d3
            .forceX()
            .x((d: any, i) => i * (canvasSize.width / (nodes.length - 1)))
        )
        .force('charge', null)
        .force('collision', d3.forceCollide().radius(COLLISION_RADIUS / 2));
      break;
    default:
      console.warn(
        'Invalid layout type, falling back to force-directed layout'
      );
      layoutType = 'force';
  }

  simulation.stop();
  simulation.tick(300);

  return nodesCopy.map((node) => ({
    ...node,
    position: {
      x: Math.max(100, Math.min(node.x || 0, canvasSize.width - 300)),
      y: Math.max(100, Math.min(node.y || 0, canvasSize.height - 300))
    }
  }));
};
