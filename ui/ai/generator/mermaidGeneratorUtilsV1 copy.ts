import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, MarkerType } from 'reactflow';
import dagre from 'dagre';
import {
  extractTitleAndType,
  removeDoubleQuoteInsideBrackets,
  removeDoubleQuoteInsideParentheses,
  removeMarkdowncode
} from '@/ui/ai/generator/aiGeneratorCanvasUtils';
import { getNodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

const applyForceDirectedLayout = (
  nodes: Node[],
  edges: Edge[],
  width: number,
  height: number
): { nodes: Node[]; edges: Edge[] } => {
  const REPULSION = 300;
  const ATTRACTION = 0.1;
  const DAMPING = 0.9;
  const MAX_VELOCITY = 10;
  const ITERATIONS = 100;

  const nodeMap = new Map(
    nodes.map((node) => [node.id, { ...node, vx: 0, vy: 0 }])
  );

  for (let i = 0; i < ITERATIONS; i++) {
    // Calculate repulsive forces
    nodeMap.forEach((node1) => {
      nodeMap.forEach((node2) => {
        if (node1.id !== node2.id) {
          const dx = node2.position.x - node1.position.x;
          const dy = node2.position.y - node1.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const force = REPULSION / (distance * distance);
          node1.vx -= (dx / distance) * force;
          node1.vy -= (dy / distance) * force;
        }
      });
    });

    // Calculate attractive forces
    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        const dx = target.position.x - source.position.x;
        const dy = target.position.y - source.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const force = ATTRACTION * distance;
        source.vx += (dx / distance) * force;
        source.vy += (dy / distance) * force;
        target.vx -= (dx / distance) * force;
        target.vy -= (dy / distance) * force;
      }
    });

    // Update positions
    nodeMap.forEach((node) => {
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.vx = Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, node.vx));
      node.vy = Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, node.vy));
      node.position.x += node.vx;
      node.position.y += node.vy;
    });
  }

  // Center and scale the layout
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  nodeMap.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
  });

  const scaleX = (width * 0.9) / (maxX - minX);
  const scaleY = (height * 0.9) / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  nodeMap.forEach((node) => {
    node.position.x = (node.position.x - minX) * scale + width * 0.05;
    node.position.y = (node.position.y - minY) * scale + height * 0.05;
  });

  return { nodes: Array.from(nodeMap.values()), edges };
};

const applyHierarchicalLayout = (
  nodes: Node[],
  edges: Edge[],
  width: number,
  height: number
): { nodes: Node[]; edges: Edge[] } => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 50 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 150, height: node.height || 40 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  g.nodes().forEach((id) => {
    const node = nodeMap.get(id);
    if (node) {
      const nodeWithPosition = g.node(id);
      node.position = {
        x: nodeWithPosition.x - (node.width || 150) / 2,
        y: nodeWithPosition.y - (node.height || 40) / 2
      };
    }
  });

  // Center and scale the layout
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + (node.width || 150));
    maxY = Math.max(maxY, node.position.y + (node.height || 40));
  });

  const scaleX = (width * 0.9) / (maxX - minX);
  const scaleY = (height * 0.9) / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  nodes.forEach((node) => {
    node.position.x = (node.position.x - minX) * scale + width * 0.05;
    node.position.y = (node.position.y - minY) * scale + height * 0.05;
  });

  return { nodes, edges };
};

const determineOptimalLayout = (
  nodes: Node[],
  edges: Edge[],
  projectDetails: string,
  width: number,
  height: number
): { nodes: Node[]; edges: Edge[] } => {
  const complexity = estimateComplexity(nodes, edges);
  const hierarchyLevel = estimateHierarchyLevel(nodes, edges);
  const interconnectedness = estimateInterconnectedness(edges, nodes.length);

  if (hierarchyLevel > 0.6 || (complexity < 0.5 && interconnectedness < 0.3)) {
    return applyHierarchicalLayout(nodes, edges, width, height);
  } else {
    return applyForceDirectedLayout(nodes, edges, width, height);
  }
};

const estimateComplexity = (nodes: Node[], edges: Edge[]): number => {
  return edges.length / (nodes.length * Math.log(nodes.length));
};

const estimateHierarchyLevel = (nodes: Node[], edges: Edge[]): number => {
  const maxDepth = findMaxDepth(nodes, edges);
  return maxDepth / nodes.length;
};

const estimateInterconnectedness = (
  edges: Edge[],
  nodeCount: number
): number => {
  return edges.length / ((nodeCount * (nodeCount - 1)) / 2);
};

const findMaxDepth = (nodes: Node[], edges: Edge[]): number => {
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
  });

  let maxDepth = 0;
  const dfs = (nodeId: string, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    adjacencyList.get(nodeId)?.forEach((childId) => dfs(childId, depth + 1));
  };

  nodes.forEach((node) => dfs(node.id, 0));
  return maxDepth;
};

export async function parseMermaidCode(
  mermaidCode: string,
  projectDetails: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(mermaidCode))
  );
  console.log('mermaidGeneratorUtils Filtered Mermaid Code:', filteredCode);

  const processedCode = filteredCode.startsWith('graph TD')
    ? filteredCode
    : `graph TD\n${filteredCode}`;

  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false });
    svgCode = await mermaid.render('mermaid-chart', processedCode);
  } catch (error: any) {
    console.error('mermaidGeneratorUtils Mermaid parsing error:', error);
    return {
      nodes: [],
      edges: []
    };
  }

  let nodes: Node[] = [];
  let edges: Edge[] = [];
  try {
    ({ nodes, edges } = convertToReactFlowElements(svgCode.svg));
  } catch (error: any) {
    console.error(
      'mermaidGeneratorUtils Error converting to React Flow elements:',
      error
    );
    return {
      nodes: [],
      edges: []
    };
  }

  const filteredNodes = nodes.filter(
    (node) =>
      node.data.title !== 'Untitled' &&
      node.data.content !== 'No description available'
  );

  const width = window.innerWidth;
  const height = window.innerHeight;

  let layoutedElements: { nodes: Node[]; edges: Edge[] };
  try {
    layoutedElements = determineOptimalLayout(
      filteredNodes,
      edges,
      projectDetails,
      width,
      height
    );
  } catch (error: any) {
    console.error('mermaidGeneratorUtils Error applying layout:', error);
    return {
      nodes: filteredNodes,
      edges
    };
  }

  return layoutedElements;
}

const convertToReactFlowElements = (
  svgCode: string
): {
  nodes: Node[];
  edges: Edge[];
} => {
  const dummyDiv = document.createElement('div');
  dummyDiv.innerHTML = svgCode;

  const mermaidNodes = Array.from(dummyDiv.querySelectorAll('.node'));
  const mermaidEdges = Array.from(dummyDiv.querySelectorAll('.edgePaths path'));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const idMap = new Map<string, string>();

  mermaidNodes.forEach((node, index) => {
    const elId = node.getAttribute('id') || `n${index}`;
    let id = elId;

    const classPattern = /^flowchart-([^-\d]+)-\d+$/;
    const matches = elId.match(classPattern);

    if (matches) {
      id = matches[1];
    }

    const nodeLabel = node.querySelector('.nodeLabel')?.textContent;
    const { title, type, content } = extractTitleAndType(nodeLabel || '');

    const position = {
      x: parseFloat(node.getAttribute('transform')!.split('(')[1]) * 1.2,
      y: parseFloat(node.getAttribute('transform')!.split(',')[1]) * 1.2
    };

    const nodeId = `${type}-${uuidv4()}`;
    const { width, height } = getNodeDimensions('note', false, false);
    nodes.push({
      id: nodeId,
      type: 'note',
      position,
      data: {
        id: nodeId,
        title: title.trim(),
        content: content.trim() || 'No description available',
        backgroundColor: '#F4F4F4',
        textColor: '#575757'
      },
      style: {
        backgroundColor: '#F4F4F4',
        color: '#575757'
      },
      width,
      height
    });

    idMap.set(id, nodeId);
  });
  mermaidEdges.forEach((edge, index) => {
    const id = edge.getAttribute('id') || `e${index}`;
    const originalSource = edge
      ?.getAttribute('class')
      ?.split(' ')[3]
      .replace('LS-', '');
    const originalTarget = edge
      ?.getAttribute('class')
      ?.split(' ')[4]
      .replace('LE-', '');

    if (!originalSource || !originalTarget) {
      return;
    }

    const source = idMap.get(originalSource) || '';
    const target = idMap.get(originalTarget) || '';

    edges.push({
      id,
      source,
      target,
      type: 'customEdge',
      markerEnd: { type: MarkerType.ArrowClosed }
    });
  });

  return {
    nodes,
    edges
  };
};
