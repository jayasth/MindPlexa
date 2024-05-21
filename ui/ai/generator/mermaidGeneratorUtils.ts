import mermaid from 'mermaid';
import { nanoid } from 'nanoid';
import { Node, Edge, MarkerType } from 'reactflow';
import dagre from 'dagre';
import {
  extractTitleAndType,
  removeDoubleQuoteInsideBrackets,
  removeDoubleQuoteInsideParentheses,
  removeMarkdowncode
} from '@/ui/ai/generator/aiGeneratorCanvasUtils';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

const applyDagreLayout = (
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  console.log('Nodes before layout:', nodes);
  console.log('Edges before layout:', edges);

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB', // Top to Bottom layout
    align: 'UL', // Upper Left alignment
    nodesep: 50, // Separation between nodes
    ranksep: 100 // Separation between ranks
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 100, height: node.height || 50 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const newNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      position: { x: dagreNode.x, y: dagreNode.y }
    };
  });

  console.log('Nodes after layout:', newNodes);
  return { nodes: newNodes, edges };
};

export async function parseMermaidCode(
  mermaidCode: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  // Render the Mermaid code and invoke the callback
  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(mermaidCode))
  );
  console.log('Filtered Mermaid Code:', filteredCode);
  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false });
    svgCode = await mermaid.render('mermaid-chart', filteredCode);
  } catch (error: any) {
    console.error('Mermaid parsing error:', error);
    if (error.message.includes('No diagram type detected')) {
      console.error(
        'Mermaid parsing error: UnknownDiagramError - No diagram type detected. Please check the configuration or syntax of your Mermaid code.'
      );
    }
    return {
      nodes: [],
      edges: []
    };
  }

  const { nodes, edges } = convertToReactFlowElements(svgCode.svg);

  // Apply layout
  const layoutedElements = applyDagreLayout(nodes, edges);

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

  // Select nodes and edges from the SVG
  const mermaidNodes = Array.from(dummyDiv.querySelectorAll('.node'));
  const mermaidEdges = Array.from(dummyDiv.querySelectorAll('.edgePaths path'));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const idMap = new Map<string, string>(); // Map to store the mapping between original IDs and nanoid IDs

  mermaidNodes.forEach((node, index) => {
    const elId = node.getAttribute('id') || `n${index}`;
    let id = elId;

    const classPattern = /^flowchart-([^-\d]+)-\d+$/;
    const matches = elId.match(classPattern);

    if (matches) {
      id = matches[1];
    }

    const nodeLabel = node.querySelector('.nodeLabel')?.textContent;
    const { title, type } = extractTitleAndType(nodeLabel || '');

    const position = {
      x: parseFloat(node.getAttribute('transform')!.split('(')[1]) * 1.2,
      y: parseFloat(node.getAttribute('transform')!.split(',')[1]) * 1.2
    };

    // Use nanoid for node IDs
    const nodeId = `${type}-${nanoid()}`;

    // Get default dimensions for note nodes
    const { width, height } = nodeDimensions.note;

    nodes.push({
      id: nodeId,
      type: 'note',
      position,
      data: { title },
      style: {
        backgroundColor: '#F4F4F4', // Default background color
        color: '#575757' // Default text color
      },
      width,
      height
    });

    // Store the mapping between the original ID and the nanoid ID
    idMap.set(id, nodeId);
  });

  // Convert edges to React-Flow elements
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
