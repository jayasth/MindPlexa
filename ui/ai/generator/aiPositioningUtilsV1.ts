import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY
} from 'd3-force';

// Define a custom type that extends both Node and SimulationNodeDatum
interface ExtendedNode extends Node, SimulationNodeDatum {
  x?: number;
  y?: number;
}

interface ExtendedSimulationLink extends SimulationLinkDatum<ExtendedNode> {
  source: string;
  target: string;
}

type LayoutType =
  | 'mindmap'
  | 'workflow'
  | 'concept-map'
  | 'grid'
  | 'hierarchical';

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: LayoutType
): Node[] => {
  switch (layoutType) {
    case 'mindmap':
      return applyMindMapLayout(nodes, edges, canvasSize);
    case 'workflow':
      return applyWorkflowDiagramLayout(nodes, edges, canvasSize);
    case 'concept-map':
      return applyConceptMapLayout(nodes, edges, canvasSize);
    case 'grid':
      return applyGridLayout(nodes, canvasSize);
    case 'hierarchical':
      return applyHierarchicalTreeLayout(nodes, edges, canvasSize);
    default:
      console.warn('Invalid layout type, falling back to mind map layout');
      return applyMindMapLayout(nodes, edges, canvasSize);
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

const applyMindMapLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const hierarchy = createHierarchy(nodes, edges);
  const radialLayout = d3
    .tree<Node>()
    .size([
      2 * Math.PI,
      Math.min(canvasSize.width, canvasSize.height) / 2 - 150
    ])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

  const root = radialLayout(hierarchy);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    if (layoutNode) {
      const angle = layoutNode.x - Math.PI / 2; // Rotate by 90 degrees
      const radius = layoutNode.y;
      const x = Math.cos(angle) * radius + canvasSize.width / 2;
      const y = Math.sin(angle) * radius + canvasSize.height / 2;
      return { ...node, position: { x, y } };
    }
    return node;
  });
};

const applyWorkflowDiagramLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const dagre = require('dagre');
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      position: { x: dagreNode.x - 100, y: dagreNode.y - 50 }
    };
  });
};

const applyConceptMapLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulationNodes: ExtendedNode[] = nodes.map((node) => ({
    ...node,
    x: Math.random() * canvasSize.width,
    y: Math.random() * canvasSize.height,
    vx: 0,
    vy: 0
  }));

  const simulationLinks: ExtendedSimulationLink[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target
  }));

  const simulation = forceSimulation(simulationNodes)
    .force(
      'link',
      forceLink(simulationLinks)
        .id((d: any) => d.id)
        .distance(200)
        .strength(0.5)
    )
    .force('charge', forceManyBody().strength(-1000))
    .force('center', forceCenter(canvasSize.width / 2, canvasSize.height / 2))
    .force('collision', forceCollide().radius(100))
    .force('x', forceX().strength(0.1))
    .force('y', forceY().strength(0.1));

  // Run the simulation synchronously
  for (let i = 0; i < 300; ++i) simulation.tick();

  return simulationNodes.map((node) => ({
    ...node,
    position: { x: node.x || 0, y: node.y || 0 }
  }));
};

const applyGridLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const nodeWidth = 200;
  const nodeHeight = 100;
  const horizontalGap = 50;
  const verticalGap = 50;

  const cols = Math.floor(
    (canvasSize.width + horizontalGap) / (nodeWidth + horizontalGap)
  );
  const rows = Math.ceil(nodes.length / cols);

  return nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * (nodeWidth + horizontalGap) + nodeWidth / 2;
    const y = row * (nodeHeight + verticalGap) + nodeHeight / 2;
    return { ...node, position: { x, y } };
  });
};

const applyHierarchicalTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const hierarchy = createHierarchy(nodes, edges);
  const treeLayout = d3
    .tree<Node>()
    .size([canvasSize.width * 0.9, canvasSize.height * 0.9])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2));

  const root = treeLayout(hierarchy);

  // Calculate the minimum x value to center the tree
  const minX = Math.min(...root.descendants().map((d) => d.x));
  const offsetX = (canvasSize.width - (root.x - minX)) / 2 - minX;

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    return layoutNode
      ? { ...node, position: { x: layoutNode.x + offsetX, y: layoutNode.y } }
      : node;
  });
};
