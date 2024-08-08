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

const applyRadialLayout = (
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 0;
  const centerY = 0;
  const minRadius = 150;
  const radiusIncrement = 100;

  const rootNode = nodes[0];
  rootNode.position = { x: centerX, y: centerY };

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const getChildNodes = (nodeId: string) => {
    return edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => nodeMap.get(edge.target)!)
      .filter(Boolean);
  };

  const calculateRadius = (level: number, childCount: number) => {
    const { width, height } = getNodeDimensions('note', false, false);
    const maxChildWidth = childCount * (width + 10);
    const radius = Math.max(
      minRadius + radiusIncrement * level,
      maxChildWidth / (2 * Math.PI)
    );
    return radius;
  };

  const positionNodesCircular = (
    parentNode: Node,
    childNodes: Node[],
    startAngle: number,
    endAngle: number,
    level: number
  ) => {
    const radius = calculateRadius(level, childNodes.length);
    const angleStep = (endAngle - startAngle) / childNodes.length;

    childNodes.forEach((node, index) => {
      const angle = startAngle + angleStep * (index + 0.5);
      node.position = {
        x: parentNode.position.x + Math.cos(angle) * radius,
        y: parentNode.position.y + Math.sin(angle) * radius
      };

      const grandChildren = getChildNodes(node.id);
      if (grandChildren.length > 0) {
        positionNodesCircular(
          node,
          grandChildren,
          angle - angleStep / 2,
          angle + angleStep / 2,
          level + 1
        );
      }
    });
  };

  const childNodes = getChildNodes(rootNode.id);
  positionNodesCircular(rootNode, childNodes, 0, 2 * Math.PI, 1);

  return { nodes, edges };
};

export async function parseMermaidCode(
  mermaidCode: string
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

  let layoutedElements: { nodes: Node[]; edges: Edge[] };
  try {
    layoutedElements = applyRadialLayout(filteredNodes, edges);
  } catch (error: any) {
    console.error('mermaidGeneratorUtils Error applying Radial layout:', error);
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
