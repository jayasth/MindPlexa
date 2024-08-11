import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, MarkerType } from 'reactflow';
import {
  extractTitleAndType,
  removeDoubleQuoteInsideBrackets,
  removeDoubleQuoteInsideParentheses,
  removeMarkdowncode
} from '@/ui/ai/generator/aiGeneratorCanvasUtils';
import { getNodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

// Function to sanitize node labels to ensure valid Mermaid syntax
function sanitizeLabel(label: string): string {
  return label.replace(/[\[\]\(\)\{\}\,]/g, ''); // Remove problematic characters
}

export async function parseMermaidCode(
  mermaidCode: string,
  projectDetails: string
): Promise<{ nodes: Node[]; edges: Edge[]; warning: string | null }> {
  // Sanitize labels within the Mermaid code
  const sanitizedCode = mermaidCode
    .split('\n')
    .map((line) => {
      const parts = line.split('[');
      if (parts.length > 1) {
        const [id, label] = parts;
        const sanitizedLabel = sanitizeLabel(label);
        return `${id}[${sanitizedLabel}]`;
      }
      return line;
    })
    .join('\n');

  console.log('Sanitized Mermaid Code:', sanitizedCode);

  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(sanitizedCode))
  );
  console.log('mermaidGeneratorUtilsV2 Filtered Mermaid Code:', filteredCode);

  const processedCode = filteredCode.startsWith('graph TD')
    ? filteredCode
    : `graph TD\n${filteredCode}`;

  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false });
    svgCode = await mermaid.render('mermaid-chart', processedCode);
  } catch (error: any) {
    console.error('mermaidGeneratorUtilsV2 Mermaid parsing error:', error);
    return {
      nodes: [],
      edges: [],
      warning: 'Error parsing Mermaid code'
    };
  }

  let nodes: Node[] = [];
  let edges: Edge[] = [];
  try {
    ({ nodes, edges } = convertToReactFlowElements(svgCode.svg));
  } catch (error: any) {
    console.error(
      'mermaidGeneratorUtilsV2 Error converting to React Flow elements:',
      error
    );
    return {
      nodes: [],
      edges: [],
      warning: 'Error converting to React Flow elements'
    };
  }

  const filteredNodes = nodes.filter(
    (node) =>
      node.data.title !== 'Untitled' &&
      node.data.content !== 'No description available'
  );

  // Ensure all nodes have initial positions
  const nodesWithPositions = filteredNodes.map((node, index) => ({
    ...node,
    position: { x: index * 150, y: index * 100 } // Initial positions
  }));

  let warning: string | null = null;
  if (nodesWithPositions.length === 0 || edges.length === 0) {
    console.warn('No nodes or edges generated from Mermaid code');
    warning =
      'The generated layout is empty. Please try again with a different project idea.';
  }

  return { nodes: nodesWithPositions, edges, warning };
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
    const id = elId.split('-')[1] || elId; // Extract the actual node ID

    const nodeLabel = node.querySelector('.nodeLabel')?.textContent;
    const { title, type, content } = extractTitleAndType(nodeLabel || '');

    const nodeId = `${type}-${uuidv4()}`;
    const { width, height } = getNodeDimensions('note', false, false);
    nodes.push({
      id: nodeId,
      type: 'note',
      position: { x: 0, y: 0 },
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
    const classes = edge.getAttribute('class')?.split(' ') || [];
    const originalSource = classes
      .find((cls) => cls.startsWith('LS-'))
      ?.replace('LS-', '');
    const originalTarget = classes
      .find((cls) => cls.startsWith('LE-'))
      ?.replace('LE-', '');

    if (!originalSource || !originalTarget) {
      console.warn(`Edge ${id} has missing source or target`);
      return;
    }

    const source = idMap.get(originalSource);
    const target = idMap.get(originalTarget);

    if (source && target) {
      edges.push({
        id,
        source,
        target,
        type: 'customEdge',
        markerEnd: { type: MarkerType.ArrowClosed }
      });
    } else {
      console.warn(
        `Edge ${id} has invalid source or target: ${originalSource} -> ${originalTarget}`
      );
    }
  });

  return {
    nodes,
    edges
  };
};
