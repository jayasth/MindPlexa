import { Node, Edge, MarkerType } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import {
  NodeRecommendation,
  NoteData,
  TaskData,
  CalendarData,
  TableData,
  DrawData
} from '@/app/prompts/generatorPromptV3';
import { getNodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

interface Relationship {
  source: string;
  target: string;
}

export const parseMermaidCode = async (
  nodeRecommendations: NodeRecommendation[],
  relationships: Relationship[]
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  try {
    const nodes: Node[] = nodeRecommendations.map((rec) => {
      const { width, height } = getNodeDimensions(rec.type, false, false);

      // Create base node structure
      const baseNode = {
        id: rec.id,
        type: rec.type,
        position: { x: 0, y: 0 },
        width,
        height,
        data: {
          title: rec.data.title,
          description: rec.data.description,
          backgroundColor: rec.data.backgroundColor || '#ffffff',
          tags: rec.data.tags || [],
          isEditing: false
        }
      };

      // Add type-specific data
      switch (rec.type) {
        case 'note':
          return {
            ...baseNode,
            data: {
              ...baseNode.data,
              content: (rec.data as NoteData).content || ''
            }
          };

        case 'task':
          return {
            ...baseNode,
            data: {
              ...baseNode.data,
              tasks: (rec.data as TaskData).tasks || [],
              priority: 'medium',
              due_date: undefined
            }
          };

        case 'calendar':
          return {
            ...baseNode,
            data: {
              ...baseNode.data,
              events: (rec.data as CalendarData).events || [],
              default_view: 'month',
              time_zone: 'UTC'
            }
          };

        case 'table':
          return {
            ...baseNode,
            data: {
              ...baseNode.data,
              columns: (rec.data as TableData).columns || [],
              rows: (rec.data as TableData).rows || [],
              settings: {
                sortable: true,
                filterable: true,
                pageSize: 10
              }
            }
          };

        case 'draw':
          return {
            ...baseNode,
            data: {
              ...baseNode.data,
              drawingData: (rec.data as DrawData).drawingData || ''
            }
          };

        default:
          return baseNode;
      }
    });

    const edges: Edge[] = relationships.map((rel) => ({
      id: uuidv4(),
      source: rel.source,
      target: rel.target,
      type: 'customEdge',
      markerEnd: { type: MarkerType.ArrowClosed }
    }));

    return { nodes, edges };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse AI response into nodes and edges');
  }
};
