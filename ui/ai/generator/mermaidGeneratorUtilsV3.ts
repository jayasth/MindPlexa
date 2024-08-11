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

export async function parseMermaidCode(
  mermaidCode: string,
  projectDetails: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(mermaidCode))
  );
  console.log('mermaidGeneratorUtilsV3 Filtered Mermaid Code:', filteredCode);

  const processedCode = filteredCode.startsWith('graph TD')
    ? filteredCode
    : `graph TD\n${filteredCode}`;

  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false });
    svgCode = await mermaid.render('mermaid-chart', processedCode);
  } catch (error: any) {
    console.error('mermaidGeneratorUtilsV3 Mermaid parsing error:', error);
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
      'mermaidGeneratorUtilsV3 Error converting to React Flow elements:',
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

  // Ensure all nodes have initial positions
  const nodesWithPositions = filteredNodes.map((node, index) => ({
    ...node,
    position: { x: index * 150, y: index * 100 } // Initial positions
  }));

  return { nodes: nodesWithPositions, edges };
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

    const nodeId = `${type}-${uuidv4()}`;
    const { width, height } = getNodeDimensions('note', false, false);
    nodes.push({
      id: nodeId,
      type: 'note',
      position: { x: 0, y: 0 }, // Initial position, will be updated by D3
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
      ?.replace('LS-', '');
    const originalTarget = edge
      ?.getAttribute('class')
      ?.split(' ')[4]
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
      console.warn(`Edge ${id} has invalid source or target`);
    }
  });

  return {
    nodes,
    edges
  };
};
