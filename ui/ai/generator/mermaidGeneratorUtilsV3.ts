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
import { NodeRecommendation } from '@/app/prompts/generatorPromptV3';

interface AIResponse {
  analysis: {
    intent: {
      primary: string;
      timeframe: string;
      complexity: string;
      audience: string;
    };
    suggestedLayout: string;
  };
  nodes: NodeRecommendation[];
  relationships: Array<{ source: string; target: string }>;
}

interface BaseNodeData {
  id: string;
  title: string;
  backgroundColor: string;
  textColor: string;
  tags: string[];
}

interface NoteNodeData extends BaseNodeData {
  type: 'note';
  noteData: {
    content: string;
  };
}

interface TaskNodeData extends BaseNodeData {
  type: 'task';
  taskData: {
    items: Array<{ text: string; status: string }>;
    priority?: string;
    due_date?: string;
  };
}

interface CalendarNodeData extends BaseNodeData {
  type: 'calendar';
  calendarData: {
    events: Array<{ date: string; title: string }>;
    default_view: string;
    time_zone: string;
  };
}

interface TableNodeData extends BaseNodeData {
  type: 'table';
  tableData: {
    columns: string[];
    data: Array<Record<string, string | number | boolean>>;
    settings?: {
      sortable?: boolean;
      filterable?: boolean;
      pageSize?: number;
      columnWidths?: Record<string, number>;
    };
  };
}

interface DrawNodeData extends BaseNodeData {
  type: 'draw';
  drawData: {
    drawing_file_url?: string;
    canvas_data?: string;
  };
}

type NodeData =
  | NoteNodeData
  | TaskNodeData
  | CalendarNodeData
  | TableNodeData
  | DrawNodeData;

export async function parseMermaidCode(
  aiResponse: AIResponse
): Promise<{ nodes: Node[]; edges: Edge[]; warning?: string }> {
  // Generate Mermaid code from AI response
  const mermaidCode = generateMermaidFromAIResponse(aiResponse);

  const filteredCode = removeDoubleQuoteInsideParentheses(
    removeDoubleQuoteInsideBrackets(removeMarkdowncode(mermaidCode))
  );

  try {
    mermaid.initialize({ startOnLoad: false });
    const svgCode = await mermaid.render('mermaid-chart', filteredCode);

    const { nodes, edges } = convertToReactFlowElements(
      svgCode.svg,
      aiResponse.nodes
    );

    return {
      nodes: nodes.filter(
        (node) => node.data.title && node.data.title !== 'Untitled'
      ),
      edges
    };
  } catch (error) {
    console.error('Mermaid parsing error:', error);
    throw new Error('Failed to generate layout');
  }
}

const generateMermaidFromAIResponse = (aiResponse: AIResponse): string => {
  let mermaidCode = 'graph TD\n';

  aiResponse.nodes.forEach((node, index) => {
    // Use node type as part of the node styling
    mermaidCode += `n${index}[${node.data.title}::${node.data.description}]\n`;
  });

  aiResponse.relationships.forEach((rel) => {
    mermaidCode += `${rel.source} --> ${rel.target}\n`;
  });

  return mermaidCode;
};

const convertToReactFlowElements = (
  svgCode: string,
  nodeRecommendations: NodeRecommendation[]
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
    const { title } = extractTitleAndType(nodeLabel || '');

    // Find corresponding node recommendation
    const nodeRec = nodeRecommendations[index];
    const nodeId = `${nodeRec.type}-${uuidv1()}`;
    const { width, height } = getNodeDimensions(nodeRec.type, false, false);

    // Create node with type-specific data
    const baseData: BaseNodeData = {
      id: nodeId,
      title: title.trim(),
      backgroundColor: index === 0 ? '#FFF9C4' : '#F4F4F4',
      textColor: '#575757',
      tags: nodeRec.data.tags || []
    };

    let nodeData: NodeData;

    switch (nodeRec.type) {
      case 'note':
        nodeData = {
          ...baseData,
          type: 'note',
          noteData: {
            content: nodeRec.data.description
          }
        };
        break;

      case 'task':
        nodeData = {
          ...baseData,
          type: 'task',
          taskData: {
            items: nodeRec.data.tasks || [],
            priority: 'medium',
            due_date: undefined
          }
        };
        break;

      case 'calendar':
        nodeData = {
          ...baseData,
          type: 'calendar',
          calendarData: {
            events: nodeRec.data.events || [],
            default_view: 'month',
            time_zone: 'UTC'
          }
        };
        break;

      case 'table':
        nodeData = {
          ...baseData,
          type: 'table',
          tableData: {
            columns: nodeRec.data.columns || [],
            data: (nodeRec.data.rows || []).map((row) =>
              Object.fromEntries(
                row.map((cell, i) => [
                  nodeRec.data.columns?.[i] || `column${i}`,
                  cell ?? ''
                ])
              )
            ),
            settings: {
              sortable: true,
              filterable: true,
              pageSize: 10
            }
          }
        };
        break;

      case 'draw':
        nodeData = {
          ...baseData,
          type: 'draw',
          drawData: {
            drawing_file_url: undefined,
            canvas_data: undefined
          }
        };
        break;

      default:
        throw new Error(`Unknown node type: ${nodeRec.type}`);
    }

    nodes.push({
      id: nodeId,
      type: nodeRec.type,
      position: { x: 0, y: 0 },
      data: nodeData,
      width,
      height
    });
    idMap.set(elId, nodeId);

    const shortId = elId.split('-')[1];
    if (shortId) {
      idMap.set(shortId, nodeId);
    }
  });

  // Process edges (keeping the same edge processing logic from V1)
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
    }
  });

  return { nodes, edges };
};
