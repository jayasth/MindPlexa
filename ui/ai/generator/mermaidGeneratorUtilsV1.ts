import mermaid from 'mermaid';
import { v1 as uuidv1 } from 'uuid';
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
): Promise<{ nodes: Node[]; edges: Edge[]; warning?: string }> {
  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(mermaidCode))
  );
  console.log('mermaidGeneratorUtilsV1 Filtered Mermaid Code:', filteredCode);

  // Remove the "Project Concept:" prefix if present
  const processedCode = filteredCode.replace(/^.*?graph TD/, 'graph TD');

  let svgCode: any;
  let warning: string | undefined;

  try {
    mermaid.initialize({ startOnLoad: false });
    svgCode = await mermaid.render('mermaid-chart', processedCode);
  } catch (error: any) {
    console.error('mermaidGeneratorUtilsV1 Mermaid parsing error:', error);
    warning = 'Error parsing Mermaid code. Using fallback layout.';
    // Generate a simple fallback layout
    svgCode = await mermaid.render(
      'mermaid-chart',
      `graph TD
      A[Project::${projectDetails}] --> B[Subtopic 1::No description available]
      A --> C[Subtopic 2::No description available]`
    );
  }

  try {
    const { nodes, edges } = convertToReactFlowElements(svgCode.svg);
    const filteredNodes = nodes.filter(
      (node) =>
        node.data.title !== 'Untitled' &&
        node.data.content !== 'No description available'
    );

    if (filteredNodes.length === 0) {
      throw new Error('No valid nodes generated');
    }

    return { nodes: filteredNodes, edges, warning };
  } catch (error: any) {
    console.error(
      'mermaidGeneratorUtilsV1 Error converting to React Flow elements:',
      error
    );
    throw error;
  }
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
    const nodeLabel = node.querySelector('.nodeLabel')?.textContent;
    const { title, type, content } = extractTitleAndType(nodeLabel || '');

    const nodeId = `${type}-${uuidv1()}`;
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

    // Map both the original ID and the extracted ID (if different)
    idMap.set(elId, nodeId);

    // Add this new mapping
    const shortId = elId.split('-')[1];
    if (shortId) {
      idMap.set(shortId, nodeId);
    }

    console.log(`Mapped node: ${elId} -> ${nodeId}`);
  });

  mermaidEdges.forEach((edge, index) => {
    const id = edge.getAttribute('id') || `e${index}`;
    const classes = edge.getAttribute('class')?.split(' ') || [];
    const originalSource = classes
      .find((c) => c.startsWith('LS-'))
      ?.replace('LS-', '');
    const originalTarget = classes
      .find((c) => c.startsWith('LE-'))
      ?.replace('LE-', '');

    if (!originalSource || !originalTarget) {
      console.warn(`Edge ${id} has missing source or target`, { classes });
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
      console.warn(`Edge ${id} has invalid source or target`, {
        originalSource,
        originalTarget,
        mappedSource: source,
        mappedTarget: target,
        idMapKeys: Array.from(idMap.keys())
      });
    }
  });

  return {
    nodes,
    edges
  };
};
