import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';
import { SimulationNodeDatum } from 'd3-force';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide
} from 'd3-force';

type SimulationNode = Node & SimulationNodeDatum;

type LayoutType =
  | 'mindmap'
  | 'timeline'
  | 'hierarchical'
  | 'workflow'
  | 'brainstorming'
  | 'force-directed'
  | 'kanban';

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number },
  layoutType: LayoutType
): Node[] => {
  switch (layoutType) {
    case 'mindmap':
      return applyMindMapLayout(nodes, edges, canvasSize);
    case 'timeline':
      return applyTimelineLayout(nodes, canvasSize);
    case 'hierarchical':
      return applyHierarchicalTreeLayout(nodes, edges, canvasSize);
    case 'workflow':
      return applyWorkflowDiagramLayout(nodes, edges, canvasSize);
    case 'brainstorming':
      return applyBrainstormingCloudLayout(nodes, canvasSize);
    case 'force-directed':
      return applyForceDirectedLayout(nodes, edges, canvasSize);
    case 'kanban':
      return applyKanbanLayout(nodes, canvasSize);
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

const applyTimelineLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const nodeWidth = 200;
  const nodeHeight = 100;
  const verticalSpacing = 150;
  const horizontalSpacing = nodeWidth + 50;
  const rowHeight = nodeHeight + verticalSpacing;
  const maxNodesPerRow = Math.floor(canvasSize.width / horizontalSpacing);

  return nodes.map((node, index) => {
    const row = Math.floor(index / maxNodesPerRow);
    const col = index % maxNodesPerRow;
    return {
      ...node,
      position: {
        x: col * horizontalSpacing + nodeWidth / 2,
        y: row * rowHeight + canvasSize.height / 4
      }
    };
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

const applyBrainstormingCloudLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;
  const radius = Math.min(canvasSize.width, canvasSize.height) / 3;

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle) * (0.8 + Math.random() * 0.4);
    const y = centerY + radius * Math.sin(angle) * (0.8 + Math.random() * 0.4);
    return { ...node, position: { x, y } };
  });
};

const applyForceDirectedLayout = (
  nodes: Node[],
  edges: Edge[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const simulationNodes: SimulationNode[] = nodes.map((node) => ({
    ...node,
    x: Math.random() * canvasSize.width,
    y: Math.random() * canvasSize.height
  }));

  const simulation = forceSimulation(simulationNodes)
    .force(
      'link',
      forceLink(edges)
        .id((d: any) => d.id)
        .distance(150)
        .strength(1)
    )
    .force('charge', forceManyBody().strength(-1000))
    .force('center', forceCenter(canvasSize.width / 2, canvasSize.height / 2))
    .force('collision', d3.forceCollide().radius(100));

  // Run the simulation synchronously
  for (let i = 0; i < 300; ++i) simulation.tick();

  return simulationNodes.map((node) => ({
    ...node,
    position: { x: node.x || 0, y: node.y || 0 }
  }));
};

const applyKanbanLayout = (
  nodes: Node[],
  canvasSize: { width: number; height: number }
): Node[] => {
  const columns = ['To Do', 'In Progress', 'Done'];
  const columnWidth = canvasSize.width / columns.length;
  const nodeWidth = 180;
  const nodeHeight = 100;
  const verticalSpacing = 20;

  const columnNodes: { [key: string]: Node[] } = {
    'To Do': [],
    'In Progress': [],
    Done: []
  };

  nodes.forEach((node) => {
    const column = node.data.status || 'To Do';
    columnNodes[column].push(node);
  });

  return nodes.map((node) => {
    const column = node.data.status || 'To Do';
    const columnIndex = columns.indexOf(column);
    const nodesInColumn = columnNodes[column];
    const nodeIndex = nodesInColumn.indexOf(node);

    return {
      ...node,
      position: {
        x: columnIndex * columnWidth + (columnWidth - nodeWidth) / 2,
        y: nodeIndex * (nodeHeight + verticalSpacing) + 50
      }
    };
  });
};
