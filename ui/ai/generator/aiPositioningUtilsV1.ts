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

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: LayoutType,
  scaleFactor: number = 1
): Node[] => {
  let layoutedNodes: Node[];

  switch (layoutType) {
    case 'mindmap':
      layoutedNodes = applyMindMapLayout(nodes, edges, canvasSize);
      break;
    case 'workflow':
      layoutedNodes = applyWorkflowDiagramLayout(nodes, edges, canvasSize);
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
      console.warn('Invalid layout type, falling back to concept map layout');
      layoutedNodes = applyConceptMapLayout(nodes, edges, canvasSize);
  }

  // Apply scale factor and center the layout
  const boundingBox = getBoundingBox(layoutedNodes);
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;
  const offsetX = centerX - (boundingBox.minX + boundingBox.maxX) / 2;
  const offsetY = centerY - (boundingBox.minY + boundingBox.maxY) / 2;

  return layoutedNodes.map((node) => ({
    ...node,
    position: {
      x: (node.position.x + offsetX) * scaleFactor,
      y: (node.position.y + offsetY) * scaleFactor
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
  canvasSize: { width: number; height: number }
): Node[] => {
  const createMindMapHierarchy = (
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

  const getMaxNodeSizeForMindMap = (nodes: Node[]): number => {
    return Math.max(
      ...nodes.map((node) => {
        const { width, height } = getNodeSize(node);
        return Math.max(width, height);
      })
    );
  };

  const hierarchy = createMindMapHierarchy(nodes, edges);
  const maxNodeSize = getMaxNodeSizeForMindMap(nodes);

  const radialLayout = d3
    .tree<Node>()
    .size([
      2 * Math.PI,
      Math.min(canvasSize.width, canvasSize.height) / 2 - maxNodeSize * 2
    ])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

  const root = radialLayout(hierarchy);

  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    if (layoutNode) {
      const angle = layoutNode.x - Math.PI / 2; // Rotate by 90 degrees
      const radius = layoutNode.y;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
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
  g.setGraph({
    rankdir: 'TB',
    nodesep: 150,
    ranksep: 200,
    marginx: 50,
    marginy: 50
  });
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
    source: edge.source,
    target: edge.target
  }));

  const getMaxNodeSizeForConceptMap = (nodes: Node[]): number => {
    return Math.max(
      ...nodes.map((node) => {
        const { width, height } = getNodeSize(node);
        return Math.max(width, height);
      })
    );
  };

  const maxNodeSize = getMaxNodeSizeForConceptMap(nodes);

  const simulation = forceSimulation(simulationNodes)
    .force(
      'link',
      forceLink(simulationLinks)
        .id((d: any) => d.id)
        .distance(maxNodeSize * 4)
        .strength(0.7)
    )
    .force('charge', forceManyBody().strength(-maxNodeSize * 20))
    .force('center', forceCenter(canvasSize.width / 2, canvasSize.height / 2))
    .force('collision', forceCollide().radius(maxNodeSize * 2))
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
  const getMaxNodeSizeForGrid = (nodes: Node[]): number => {
    return Math.max(
      ...nodes.map((node) => {
        const { width, height } = getNodeSize(node);
        return Math.max(width, height);
      })
    );
  };

  const maxNodeSize = getMaxNodeSizeForGrid(nodes);
  const horizontalGap = maxNodeSize * 1.5;
  const verticalGap = maxNodeSize * 1.5;

  const cols = Math.floor(Math.sqrt(nodes.length));
  const rows = Math.ceil(nodes.length / cols);

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
  const createHierarchicalTreeHierarchy = (
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

  const getMaxNodeSizeForHierarchicalTree = (nodes: Node[]): number => {
    return Math.max(
      ...nodes.map((node) => {
        const { width, height } = getNodeSize(node);
        return Math.max(width, height);
      })
    );
  };

  const hierarchy = createHierarchicalTreeHierarchy(nodes, edges);
  const maxNodeSize = getMaxNodeSizeForHierarchicalTree(nodes);

  const treeLayout = d3
    .tree<Node>()
    .size([canvasSize.width * 0.9, canvasSize.height * 0.8])
    .separation((a, b) => (a.parent === b.parent ? 1.5 : 2) * maxNodeSize);

  const root = treeLayout(hierarchy);

  const minX = Math.min(...root.descendants().map((d) => d.x));
  const maxX = Math.max(...root.descendants().map((d) => d.x));
  const minY = Math.min(...root.descendants().map((d) => d.y));
  const maxY = Math.max(...root.descendants().map((d) => d.y));

  const scaleX = (canvasSize.width * 0.8) / (maxX - minX);
  const scaleY = (canvasSize.height * 0.8) / (maxY - minY);

  return nodes.map((node) => {
    const layoutNode = root.find((d) => d.data.id === node.id);
    const { width, height } = getNodeSize(node);
    return layoutNode
      ? {
          ...node,
          position: {
            x:
              (layoutNode.x - minX) * scaleX +
              (canvasSize.width * 0.1 - width / 2),
            y:
              (layoutNode.y - minY) * scaleY +
              (canvasSize.height * 0.1 - height / 2)
          }
        }
      : node;
  });
};

const getBoundingBox = (
  nodes: Node[]
): { minX: number; minY: number; maxX: number; maxY: number } => {
  return nodes.reduce(
    (bbox, node) => ({
      minX: Math.min(bbox.minX, node.position.x),
      minY: Math.min(bbox.minY, node.position.y),
      maxX: Math.max(bbox.maxX, node.position.x + (node.width || 0)),
      maxY: Math.max(bbox.maxY, node.position.y + (node.height || 0))
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
};
