import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchCanvas,
  saveCanvasState,
  CanvasState
} from '@/utils/canvas/canvasService';
import type { Node as ReactFlowNode, Edge } from 'reactflow';
import useNodeStore from '../nodes/useNodeStore';
import useEdgeStore from '../edges/useEdgeStore';
import { enableMapSet } from 'immer';

// Enable the MapSet plugin for Immer
enableMapSet();

interface CanvasStoreState {
  canvasId: string;
  setCanvasId: (id: string) => void;
  saveCanvas: () => Promise<void>;
  loadCanvas: (canvasId: string) => Promise<void>;
  isLoading: boolean;
  lastLoadTime: number;
  saveCanvasTimeout?: NodeJS.Timeout;
  nodes: ReactFlowNode<NodeData>[]; // Updated type to match ReactFlowNode
  edges: Edge[];
}

interface NodeData {
  backgroundColor?: string;
  textColor?: string;
  isTemporary?: boolean;
  isEditing?: boolean;
  attachedFiles?: Array<{
    id: string;
    type: string;
    name: string;
    size: number;
    storagePath: string;
    mimeType: string;
    url: string;
    isFile: boolean;
  }>;
  tasks?: Array<unknown>;
  events?: Array<unknown>;
  completedTasks?: number;
  totalTasks?: number;
  showCompletedTasks?: boolean;
  showDueDate?: boolean;
  showPriority?: boolean;
  sortBy?: string;
  drawingFileUrl?: string;
  currentTool?: string;
  settings?: Record<string, unknown>;
  currentColor?: string;
  currentStrokeWidth?: number;
  columns?: Array<unknown>;
  rows?: Array<unknown>;
  defaultColumnType?: string;
  dateFormat?: string;
  tableSettings?: Record<string, unknown>;
  [key: string]: unknown;
}

const processNode = async (
  node: ReactFlowNode<NodeData>
): Promise<ReactFlowNode<NodeData> | null> => {
  // Updated return type
  if (!node) return null;

  console.log('useCanvasStore: Processing node:', node);

  let position;
  try {
    position =
      typeof node.position === 'string'
        ? JSON.parse(node.position)
        : node.position;
  } catch (error) {
    console.error('Error parsing position JSON:', error);
    position = { x: 200, y: 200 };
  }

  const isDesktop = window.innerWidth >= 768;

  // Parse tasks JSON string if it exists
  let tasks = [];
  if (node.type === 'task' && node.data && node.data.tasks) {
    try {
      tasks =
        typeof node.data.tasks === 'string'
          ? JSON.parse(node.data.tasks)
          : node.data.tasks;
    } catch (error) {
      console.error('Error parsing tasks JSON:', error);
    }
  }

  // Parse events JSON string if it exists
  let events = [];
  if (node.type === 'calendar' && node.data && node.data.events) {
    try {
      events =
        typeof node.data.events === 'string'
          ? JSON.parse(node.data.events)
          : node.data.events;
    } catch (error) {
      console.error('Error parsing events JSON:', error);
    }
  }

  // Parse columns and rows JSON strings if they exist
  let columns = [],
    rows = [],
    tableSettings = {};
  if (node.type === 'table' && node.data) {
    try {
      columns = node.data.columns
        ? JSON.parse(node.data.columns as unknown as string)
        : [];
      rows = node.data.rows
        ? JSON.parse(node.data.rows as unknown as string)
        : [];
      tableSettings = node.data.settings
        ? JSON.parse(node.data.settings as unknown as string)
        : {};
    } catch (error) {
      console.error('Error parsing table data JSON:', error);
    }
  }

  return {
    id: node.id,
    type: node.type || 'default',
    position,
    data: {
      ...node,
      ...node.data,
      backgroundColor: node.data?.backgroundColor,
      textColor: node.data?.textColor,
      isTemporary: node.data?.isTemporary,
      isEditing: node.data?.isEditing,
      attachedFiles: node.data?.attachedFiles || [],
      tasks: tasks,
      events: events,
      completedTasks: node.data?.completedTasks || 0,
      totalTasks: node.data?.totalTasks || 0,
      showCompletedTasks: node.data?.showCompletedTasks ?? true,
      showDueDate: node.data?.showDueDate ?? true,
      showPriority: node.data?.showPriority ?? true,
      sortBy: node.data?.sortBy || '',
      drawingFileUrl: node.data?.drawingFileUrl || '',
      currentTool: node.data?.currentTool || '',
      settings: node.data?.settings || {},
      currentColor: node.data?.currentColor || '',
      currentStrokeWidth: node.data?.currentStrokeWidth || 0,
      columns: columns,
      rows: rows,
      defaultColumnType: node.data?.defaultColumnType || 'text',
      dateFormat: node.data?.dateFormat || 'yyyy-MM-dd',
      tableSettings: tableSettings
    },
    width: node.data?.isEditing
      ? (isDesktop ? node.width : node.width) || node.width
      : node.width,
    height: node.data?.isEditing
      ? (isDesktop ? node.height : node.height) || node.height
      : node.height
  };
};

const processEdge = (edge: Edge): Edge => ({
  id: edge.id,
  source: edge.source || '',
  target: edge.target || '',
  type: 'customEdge'
});

const useCanvasStore = create<CanvasStoreState>()(
  devtools((set, get) => {
    let previousNodes: ReactFlowNode<NodeData>[] = []; // Updated type to match ReactFlowNode
    let previousEdges: Edge[] = [];

    return {
      canvasId: uuidv4(),
      isLoading: false,
      lastLoadTime: 0,
      nodes: [], // Ensure this is of type Node[]
      edges: [],
      setCanvasId: (id) => set({ canvasId: id }),
      saveCanvas: async () => {
        const { canvasId, nodes, edges } = get();

        if (
          JSON.stringify(nodes) !== JSON.stringify(previousNodes) ||
          JSON.stringify(edges) !== JSON.stringify(previousEdges)
        ) {
          // Only save if there are changes
          previousNodes = nodes;
          previousEdges = edges;

          const canvasState: CanvasState = {
            canvasId,
            nodes: nodes.map((node) => ({
              ...node,
              type: node.type || 'default' // Ensure type is always a string
            })),
            edges
          };

          try {
            await saveCanvasState(canvasId, canvasState);
            console.log('useCanvasStore: Canvas state saved successfully');
          } catch (error) {
            console.error('useCanvasStore: Error saving canvas state:', error);
          }
        } else {
          console.log('useCanvasStore: No changes detected, skipping save');
        }
      },
      loadCanvas: async (canvasId: string) => {
        set({ isLoading: true });
        try {
          const canvasData = await fetchCanvas(canvasId);
          console.log('useCanvasStore: Fetched canvas data:', canvasData);

          const nodes = await Promise.all(canvasData.nodes.map(processNode));
          const edges = canvasData.edges.map(processEdge);

          useNodeStore.getState().setNodes(
            nodes.filter(
              (node): node is ReactFlowNode<NodeData> => node !== null // Updated type assertion
            )
          );
          useEdgeStore.getState().setEdges(edges);

          set({
            canvasId,
            lastLoadTime: Date.now(),
            isLoading: false,
            nodes: nodes.filter(
              (node): node is ReactFlowNode<NodeData> => node !== null // Updated type assertion
            ),
            edges
          });

          console.log('useCanvasStore: Canvas loaded successfully');
        } catch (error) {
          console.error('useCanvasStore: Error loading canvas:', error);
          set({ isLoading: false });
        }
      }
    };
  })
);

export default useCanvasStore;
