import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

export type LayoutType = 'force' | 'radial' | 'tree';

export const applyD3Layout = (
  nodes: Node[],
  edges: Edge[],
  layoutType: LayoutType,
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[]);

  switch (layoutType) {
    case 'force':
      simulation
        .force(
          'link',
          d3
            .forceLink(edges)
            .id((d: any) => d.id)
            .distance(100)
        )
        .force('charge', d3.forceManyBody().strength(-500))
        .force(
          'center',
          d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2)
        );
      break;
    case 'radial':
      simulation
        .force(
          'link',
          d3
            .forceLink(edges)
            .id((d: any) => d.id)
            .distance(100)
        )
        .force(
          'r',
          d3.forceRadial(200, canvasSize.width / 2, canvasSize.height / 2)
        )
        .force('charge', d3.forceManyBody().strength(-1000));
      break;
    case 'tree':
      const root = d3
        .stratify()
        .id((d: any) => d.id)
        .parentId((d: any) => edges.find((e) => e.target === d.id)?.source)(
        nodes
      );

      const treeLayout = d3.tree().size([canvasSize.width, canvasSize.height]);
      const treeData = treeLayout(root);

      treeData.each((d: any) => {
        const node = nodes.find((n) => n.id === d.id);
        if (node) {
          node.position = { x: d.x, y: d.y };
        }
      });

      return nodes;
  }

  simulation.tick(300);

  return nodes.map((node) => ({
    ...node,
    position: { x: (node as any).x, y: (node as any).y }
  }));
};
