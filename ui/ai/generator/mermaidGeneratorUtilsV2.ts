import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, MarkerType } from 'reactflow';
import * as d3 from 'd3-hierarchy';
import {
  extractTitleAndType,
  removeDoubleQuoteInsideBrackets,
  removeDoubleQuoteInsideParentheses,
  removeMarkdowncode
} from '@/ui/ai/generator/aiGeneratorCanvasUtils';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

interface HierarchyData {
  id: string;
  children: HierarchyData[];
}

const applyD3Layout = (
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  console.log('Nodes before layout:', nodes);
  console.log('Edges before layout:', edges);

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // Create a hierarchical structure
  const hierarchy: { [key: string]: string[] } = {};
  edges.forEach((edge) => {
    if (!hierarchy[edge.source]) {
      hierarchy[edge.source] = [];
    }
    hierarchy[edge.source].push(edge.target);
  });

  // Find the root node (node with no incoming edges)
  const rootId = nodes.find(
    (node) => !edges.some((edge) => edge.target === node.id)
  )?.id;
  if (!rootId) return { nodes, edges };

  const createHierarchy = (nodeId: string): HierarchyData => {
    return {
      id: nodeId,
      children: (hierarchy[nodeId] || []).map(createHierarchy)
    };
  };

  const root = d3.hierarchy<HierarchyData>(createHierarchy(rootId));

  const treeLayout = d3.tree<HierarchyData>().size([800, 600]);
  const treeData = treeLayout(root);

  const newNodes = treeData.descendants().map((d) => {
    const originalNode = nodeMap.get(d.data.id)!;
    return {
      ...originalNode,
      position: { x: d.x + 400, y: d.y + 100 } // Add offsets to center the layout
    };
  });

  console.log('Nodes after layout:', newNodes);
  return { nodes: newNodes, edges };
};

export async function parseMermaidCode(
  mermaidCode: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  // Remove any text before 'graph TD' and ensure it starts with 'graph TD'
  const graphIndex = mermaidCode.indexOf('graph TD');
  const filteredCode =
    graphIndex !== -1
      ? mermaidCode.slice(graphIndex)
      : `graph TD\n${mermaidCode}`;

  console.log('mermaidGeneratorUtilsV2 Filtered Mermaid Code:', filteredCode);

  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    svgCode = await mermaid.render('mermaid-svg', filteredCode);
  } catch (error) {
    console.error('mermaidGeneratorUtilsV2 Mermaid parsing error:', error);
    throw new Error('Failed to parse Mermaid code');
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
    return { nodes: [], edges: [] };
  }

  // Filter out nodes without meaningful content or incorrectly formatted entries
  const filteredNodes = nodes.filter(
    (node) =>
      node.data.title !== 'Untitled' &&
      node.data.content !== 'No description available'
  );

  // Apply layout
  let layoutedElements: { nodes: Node[]; edges: Edge[] };
  try {
    layoutedElements = applyD3Layout(filteredNodes, edges);
  } catch (error: any) {
    console.error('mermaidGeneratorUtilsV2 Error applying D3 layout:', error);
    return { nodes: filteredNodes, edges };
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
    const { type, title, content } = extractTitleAndType(nodeLabel || '');

    const position = {
      x: parseFloat(node.getAttribute('transform')!.split('(')[1]) * 1.2,
      y: parseFloat(node.getAttribute('transform')!.split(',')[1]) * 1.2
    };

    const nodeId = `note-${uuidv4()}`; // Always create NoteNodes
    const { viewWidth: width, viewHeight: height } = nodeDimensions.note;
    nodes.push({
      id: nodeId,
      type: 'note', // Set type to 'note'
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
