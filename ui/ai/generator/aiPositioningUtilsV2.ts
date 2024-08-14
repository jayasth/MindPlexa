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

export type LayoutType =
  | 'mindmap'
  | 'workflow'
  | 'concept-map'
  | 'grid'
  | 'hierarchical';

export const layoutOptions: { value: LayoutType; label: string }[] = [
  { value: 'mindmap', label: 'Mind Map' },
  { value: 'workflow', label: 'Workflow Diagram' },
  { value: 'concept-map', label: 'Concept Map' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'hierarchical', label: 'Hierarchical Tree' }
];

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

const applyMindMapLayout = (
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
    .size([
      2 * Math.PI,
      Math.min(canvasSize.width, canvasSize.height) / 2 - 100
    ])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

  const root = treeLayout(hierarchy);

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

const applyWorkflowDiagramLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulation = forceSimulation(nodes as ExtendedNode[])
    .force(
      'link',
      forceLink(edges as ExtendedSimulationLink[])
        .id((d: any) => d.id)
        .distance(200)
    )
    .force('charge', forceManyBody().strength(-1000))
    .force('center', forceCenter(canvasSize.width / 2, canvasSize.height / 2))
    .force('collision', forceCollide().radius(100))
    .force('x', forceX().strength(0.1))
    .force('y', forceY().strength(0.1));

  simulation.stop();
  simulation.tick(300);

  return nodes.map((node) => ({
    ...node,
    position: {
      x: Math.max(
        50,
        Math.min((node as ExtendedNode).x || 0, canvasSize.width - 50)
      ),
      y: Math.max(
        50,
        Math.min((node as ExtendedNode).y || 0, canvasSize.height - 50)
      )
    }
  }));
};

const applyConceptMapLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulation = forceSimulation(nodes as ExtendedNode[])
    .force(
      'link',
      forceLink(edges as ExtendedSimulationLink[])
        .id((d: any) => d.id)
        .distance(150)
    )
    .force('charge', forceManyBody().strength(-500))
    .force('center', forceCenter(canvasSize.width / 2, canvasSize.height / 2))
    .force('collision', forceCollide().radius(80));

  simulation.stop();
  simulation.tick(300);

  return nodes.map((node) => ({
    ...node,
    position: {
      x: Math.max(
        50,
        Math.min((node as ExtendedNode).x || 0, canvasSize.width - 50)
      ),
      y: Math.max(
        50,
        Math.min((node as ExtendedNode).y || 0, canvasSize.height - 50)
      )
    }
  }));
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

const applyHierarchicalTreeLayout = (
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
