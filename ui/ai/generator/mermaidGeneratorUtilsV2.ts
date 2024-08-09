import mermaid from 'mermaid';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, MarkerType } from 'reactflow';
import * as d3 from 'd3-hierarchy';
import { extractTitleAndType } from '@/ui/ai/generator/aiGeneratorCanvasUtilsV2';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

export async function parseMermaidCode(
  mermaidCode: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const graphIndex = mermaidCode.indexOf('graph TD');
  let filteredCode =
    graphIndex !== -1
      ? mermaidCode.slice(graphIndex)
      : `graph TD\n${mermaidCode}`;

  // Replace double quotes with single quotes in node labels
  filteredCode = filteredCode.replace(/\[([^\]]*)\]/g, (match) => {
    return match.replace(/"/g, "'");
  });

  console.log('mermaidGeneratorUtilsV2 Filtered Mermaid Code:', filteredCode);

  let svgCode: any;

  try {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    svgCode = await mermaid.render('mermaid-svg', filteredCode);
  } catch (error) {
    console.error('mermaidGeneratorUtilsV2 Mermaid parsing error:', error);
    throw new Error('Failed to parse Mermaid code');
  }

  let { nodes, edges } = convertToReactFlowElements(svgCode.svg);

  // Filter out nodes without meaningful content
  nodes = nodes.filter(
    (node) =>
      node.data.title !== 'Untitled' &&
      node.data.content !== 'No description available'
  );

  // Apply layout
  const layoutedElements = applyD3Layout(nodes, edges);

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
  const mermaidEdges = Array.from(dummyDiv.querySelectorAll('.edgePath'));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const idMap = new Map<string, string>();

  mermaidNodes.forEach((node, index) => {
    const elId = node.id;
    const nodeLabel = node.querySelector('.label')?.textContent;
    const { title, content } = extractTitleAndType(nodeLabel || '');

    const nodeId = `note-${uuidv4()}`;
    const { viewWidth: width, viewHeight: height } = nodeDimensions.note;
    nodes.push({
      id: nodeId,
      type: 'note',
      position: { x: 0, y: 0 }, // We'll set the position later
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

    idMap.set(elId, nodeId);
  });

  mermaidEdges.forEach((edge, index) => {
    const sourceId = edge
      .querySelector('.path')
      ?.getAttribute('marker-start')
      ?.split('-')[1];
    const targetId = edge
      .querySelector('.path')
      ?.getAttribute('marker-end')
      ?.split('-')[1];

    if (sourceId && targetId) {
      const source = idMap.get(sourceId);
      const target = idMap.get(targetId);

      if (source && target) {
        edges.push({
          id: `e${index}`,
          source,
          target,
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }
    }
  });

  return { nodes, edges };
};

const applyD3Layout = (
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  // Find all root nodes (nodes with no incoming edges)
  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  if (rootNodes.length === 0) {
    return { nodes, edges };
  }

  // If there's only one root, use the existing approach
  if (rootNodes.length === 1) {
    const hierarchy = d3
      .stratify()
      .id((d: any) => d.id)
      .parentId((d: any) => edges.find((e) => e.target === d.id)?.source)(
      nodes
    );

    const treeLayout = d3.tree().size([800, 600]);
    const treeData = treeLayout(hierarchy);

    const newNodes = treeData.descendants().map((d: any) => ({
      ...nodes.find((n) => n.id === d.id)!,
      position: { x: d.x, y: d.y }
    }));

    return { nodes: newNodes, edges };
  }

  // If there are multiple roots, create a virtual root
  const virtualRootId = 'virtual-root';
  const virtualRoot: Node = {
    id: virtualRootId,
    type: 'note',
    position: { x: 0, y: 0 },
    data: { id: virtualRootId, title: 'Virtual Root', content: '' }
  };

  const nodesWithVirtualRoot = [virtualRoot, ...nodes];
  const edgesWithVirtualRoot = [
    ...edges,
    ...rootNodes.map((root) => ({
      id: `${virtualRootId}-${root.id}`,
      source: virtualRootId,
      target: root.id,
      type: 'customEdge'
    }))
  ];

  const hierarchy = d3
    .stratify()
    .id((d: any) => d.id)
    .parentId(
      (d: any) => edgesWithVirtualRoot.find((e) => e.target === d.id)?.source
    )(nodesWithVirtualRoot);

  const treeLayout = d3.tree().size([1200, 800]);
  const treeData = treeLayout(hierarchy);

  const newNodes = treeData
    .descendants()
    .filter((d) => d.id !== virtualRootId)
    .map((d: any) => ({
      ...nodes.find((n) => n.id === d.id)!,
      position: { x: d.x, y: d.y - 100 } // Adjust Y position to account for virtual root
    }));

  return { nodes: newNodes, edges };
};
