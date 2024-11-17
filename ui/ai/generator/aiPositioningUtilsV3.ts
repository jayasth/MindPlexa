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
import { getNodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import dagre from 'dagre';

interface ExtendedNode extends Node, SimulationNodeDatum {
  x?: number;
  y?: number;
}

interface ExtendedSimulationLink extends SimulationLinkDatum<ExtendedNode> {
  source: string | ExtendedNode;
  target: string | ExtendedNode;
}

type LayoutType =
  | 'mindmap'
  | 'workflow'
  | 'concept-map'
  | 'grid'
  | 'hierarchical';

// Get node-type specific spacing
const getNodeTypeSpacing = (node: Node) => {
  switch (node.type) {
    case 'calendar':
      return { horizontal: 300, vertical: 250 };
    case 'table':
      return { horizontal: 280, vertical: 200 };
    case 'draw':
      return { horizontal: 250, vertical: 250 };
    case 'task':
      return { horizontal: 220, vertical: 180 };
    default: // note
      return { horizontal: 200, vertical: 150 };
  }
};

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: LayoutType,
  scaleFactor: number = 1
): Node[] => {
  // Apply node-specific spacing to layout calculations
  const nodeSpacing = nodes.map((node) => getNodeTypeSpacing(node));

  // Use the maximum spacing values for layout
  const maxHorizontalSpacing = Math.max(
    ...nodeSpacing.map((s) => s.horizontal)
  );
  const maxVerticalSpacing = Math.max(...nodeSpacing.map((s) => s.vertical));

  let layoutedNodes: Node[];

  switch (layoutType) {
    case 'mindmap':
      layoutedNodes = applyMindMapLayout(
        nodes,
        edges,
        canvasSize,
        maxHorizontalSpacing,
        maxVerticalSpacing
      );
      break;
    case 'workflow':
      layoutedNodes = applyWorkflowDiagramLayout(nodes, edges);
      break;
    case 'concept-map':
      layoutedNodes = applyConceptMapLayout(nodes, edges, canvasSize);
      break;
    case 'grid':
      layoutedNodes = applyGridLayout(nodes, canvasSize);
      break;
    case 'hierarchical':
      layoutedNodes = applyHierarchicalTreeLayout(nodes, edges, canvasSize);
      break;
    default:
      layoutedNodes = applyConceptMapLayout(nodes, edges, canvasSize);
  }

  return layoutedNodes.map((node) => ({
    ...node,
    position: {
      x: (node.position?.x || 0) * scaleFactor,
      y: (node.position?.y || 0) * scaleFactor
    }
  }));
};

const getNodeSize = (node: Node) => {
  const nodeType = node.type || 'note';
  const { width, height } = getNodeDimensions(nodeType, false, false);
  return { width, height };
};

const applyMindMapLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  maxHorizontalSpacing: number,
  maxVerticalSpacing: number
): Node[] => {
  const hierarchy = createHierarchy(nodes, edges);

  // Use spacing values to calculate the radius
  const baseRadius = Math.min(canvasSize.width, canvasSize.height) / 2;
  const radiusWithSpacing =
    baseRadius - Math.max(maxHorizontalSpacing, maxVerticalSpacing);

  const radialLayout = d3
    .tree<Node>()
    .size([2 * Math.PI, radiusWithSpacing])
    .separation((a, b) => {
      // Use spacing values for node separation
      const baseSeparation = (a.parent === b.parent ? 1 : 2) / a.depth;
      return baseSeparation * (maxHorizontalSpacing / 100); // Scale separation based on spacing
    });

  const root = radialLayout(hierarchy);

  // Adjust the layout to fit the canvas and avoid overlapping
  const minAngle = Math.min(...root.descendants().map((d) => d.x));
  const maxAngle = Math.max(...root.descendants().map((d) => d.x));
  const angleRange = maxAngle - minAngle;

  // Use vertical spacing for padding factor calculation
  const paddingFactor = 1 + maxVerticalSpacing / 1000;
  const scaleFactor = (2 * Math.PI) / (angleRange * paddingFactor);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    if (layoutNode) {
      const angle = (layoutNode.x - minAngle) * scaleFactor - Math.PI / 2;
      const radius = layoutNode.y;
      const x = Math.cos(angle) * radius + canvasSize.width / 2;
      const y = Math.sin(angle) * radius + canvasSize.height / 2;
      return { ...node, position: { x, y } };
    }
    return node;
  });
};

const applyWorkflowDiagramLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const { width, height } = getNodeSize(node);
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const { width, height } = getNodeSize(node);
    return {
      ...node,
      position: { x: dagreNode.x - width / 2, y: dagreNode.y - height / 2 }
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
    source: edge.source || '',
    target: edge.target || ''
  }));

  const maxNodeSize = Math.max(
    ...nodes.map((node) => {
      const { width, height } = getNodeSize(node);
      return Math.max(width, height);
    })
  );

  const simulation = forceSimulation(simulationNodes)
    .force(
      'link',
      forceLink(simulationLinks)
        .id((d: SimulationNodeDatum) => (d as ExtendedNode).id)
        .distance(maxNodeSize * 2)
        .strength(0.5)
    )
    .force('charge', forceManyBody().strength(-maxNodeSize * 10))
    .force('center', forceCenter(canvasSize.width / 2, canvasSize.height / 2))
    .force('collision', forceCollide().radius(maxNodeSize))
    .force('x', forceX().strength(0.1))
    .force('y', forceY().strength(0.1));

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
  const maxNodeSize = Math.max(
    ...nodes.map((node) => {
      const { width, height } = getNodeSize(node);
      return Math.max(width, height);
    })
  );

  const horizontalGap = maxNodeSize / 2;
  const verticalGap = maxNodeSize / 2;

  const cols = Math.floor(
    (canvasSize.width + horizontalGap) / (maxNodeSize + horizontalGap)
  );

  return nodes.map((node, index) => {
    const { width, height } = getNodeSize(node);
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * (maxNodeSize + horizontalGap) + width / 2;
    const y = row * (maxNodeSize + verticalGap) + height / 2;
    return { ...node, position: { x, y } };
  });
};

const applyHierarchicalTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const hierarchy = createHierarchy(nodes, edges);
  const maxNodeSize = Math.max(
    ...nodes.map((node) => {
      const { width, height } = getNodeSize(node);
      return Math.max(width, height);
    })
  );

  const treeLayout = d3
    .tree<Node>()
    .size([canvasSize.width * 0.9, canvasSize.height * 0.9])
    .separation(
      (a, b) => ((a.parent === b.parent ? 1 : 2) * maxNodeSize) / 100
    );

  const root = treeLayout(hierarchy);

  const minX = Math.min(...root.descendants().map((d) => d.x));
  const offsetX = (canvasSize.width - (root.x - minX)) / 2 - minX;

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    const { width, height } = getNodeSize(node);
    return layoutNode
      ? {
          ...node,
          position: {
            x: layoutNode.x + offsetX - width / 2,
            y: layoutNode.y - height / 2
          }
        }
      : node;
  });
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
    return d3.hierarchy(node, (n) => childrenMap.get(n.id) || []);
  };

  return buildHierarchy(rootNode);
};
