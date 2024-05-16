import mermaid from 'mermaid';
import { Node, Edge, MarkerType } from 'reactflow';
import {
  extractLabelAndType,
  removeDoubleQuoteInsideBrackets,
  removeDoubleQuoteInsideParentheses,
  removeMarkdowncode
} from '@/ui/canvasEditor/utils/aiCanvasUtils';

export async function parseMermaidCode(
  mermaidCode: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  console.log('mermaidCode');
  console.log(mermaidCode);
  // Render the Mermaid code and invoke the callback
  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(mermaidCode))
  );
  console.log('filteredCode');
  console.log(filteredCode);
  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false }); // Initialize Mermaid (if not already initialized)
    svgCode = await mermaid.render('mermaid-chart', filteredCode);
    // Continue with the code if there are no parsing errors
  } catch (error) {
    // Handle parsing errors here
    console.error('Mermaid parsing error:', error);
    alert('Mermaid parsing error');
    return {
      nodes: [],
      edges: []
    };
  }
  return convertToReactFlowElements(svgCode.svg);
}

const convertToReactFlowElements = (
  svgCode: string
): {
  nodes: Node[];
  edges: Edge[];
} => {
  const parser = new DOMParser();
  const svgElement = parser.parseFromString(svgCode, 'image/svg+xml');
  const mermaidNodes = svgElement.querySelectorAll('.node');
  const mermaidEdges = svgElement.querySelectorAll('.edgeLabel');

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Convert nodes to React-Flow elements
  mermaidNodes.forEach((node, index) => {
    const id = node.getAttribute('id') || `n${index}`;
    const { label, type } = extractLabelAndType(node.textContent || '');
    const position = {
      x:
        parseFloat(
          node.getAttribute('transform')!.split('(')[1].split(',')[0]
        ) * 1.2,
      y: parseFloat(node.getAttribute('transform')!.split(',')[1]) * 1.2
    };

    nodes.push({
      id,
      type: 'noteNode',
      position,
      data: { label, title: label }
    });
  });

  // Convert edges to React-Flow elements
  mermaidEdges.forEach((edge, index) => {
    const id = edge.getAttribute('id') || `e${index}`;
    const source = edge
      ?.getAttribute('class')
      ?.split(' ')[3]
      .replace('LS-', '');
    const target = edge
      ?.getAttribute('class')
      ?.split(' ')[4]
      .replace('LE-', '');

    if (!source || !target) {
      return;
    }

    edges.push({
      id,
      source,
      target,
      type: 'default',
      markerEnd: { type: MarkerType.ArrowClosed }
    });
  });

  // Now, you have reactFlowElements containing the data in the format expected by React-Flow.
  console.log(nodes, edges); // Print for demonstration
  return {
    nodes,
    edges
  };
};
