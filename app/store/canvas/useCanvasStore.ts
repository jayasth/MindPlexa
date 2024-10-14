import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchCanvas,
  saveCanvasState,
  Node,
  CanvasState as CanvasServiceState,
  AttachedFile
} from '@/utils/canvas/canvasService';
import useNodeStore from '../nodes/useNodeStore';
import useEdgeStore from '../edges/useEdgeStore';
import { enableMapSet } from 'immer';
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import { Database } from '@/types_db';
import { getNodeSpecificData } from '@/utils/canvas/nodeSpecificDataService';

// Enable the MapSet plugin for Immer
enableMapSet();

interface CanvasState {
  canvasId: string;
  setCanvasId: (id: string) => void;
  saveCanvas: () => Promise<void>;
  loadCanvas: (canvasId: string) => Promise<void>;
  isLoading: boolean;
  lastLoadTime: number;
  saveCanvasTimeout?: NodeJS.Timeout;
}

type NodeType = Database['public']['Enums']['node_type'];

const processNode = async (
  node: Partial<Node>
): Promise<ReactFlowNode | null> => {
  if (!node) return null;

  console.log('useCanvasStore: Processing node:', node);

  let position: { x: number; y: number };
  try {
    position =
      typeof node.position === 'string'
        ? JSON.parse(node.position)
        : node.position || { x: 200, y: 200 };
  } catch (error) {
    console.error('Error parsing position JSON:', error);
    position = { x: 200, y: 200 };
  }

  const isDesktop = window.innerWidth >= 768;

  // Parse tasks JSON string if it exists
  let tasks: unknown[] = [];
  if (node.type === 'task' && node.data && node.data.tasks) {
    try {
      tasks =
        typeof node.data.tasks === 'string'
          ? JSON.parse(node.data.tasks as unknown as string)
          : node.data.tasks;
    } catch (error) {
      console.error('Error parsing tasks JSON:', error);
    }
  }

  // Parse events JSON string if it exists
  let events: unknown[] = [];
  if (node.type === 'calendar' && node.data && node.data.events) {
    try {
      events =
        typeof node.data.events === 'string'
          ? JSON.parse(node.data.events as unknown as string)
          : node.data.events;
    } catch (error) {
      console.error('Error parsing events JSON:', error);
    }
  }

  // Parse columns and rows JSON strings if they exist
  let columns: unknown[] = [],
    rows: unknown[] = [],
    tableSettings: Record<string, unknown> = {};
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

  // Load tool settings for draw nodes
  let processedData: Record<string, unknown> = {};
  if (node.type === 'draw' && node.id) {
    const drawData = await getNodeSpecificData(node.id, 'draw');
    if (drawData) {
      processedData.drawingFileUrl = drawData.drawing_file_url;
      processedData.currentTool = drawData.current_tool;
      processedData.settings = drawData.settings || {}; // Use settings directly
      processedData.currentColor = drawData.current_color;
      processedData.currentStrokeWidth = drawData.current_stroke_width;
    }
  }

  return {
    id: node.id || '',
    type: node.type as NodeType,
    position,
    data: {
      ...node,
      ...node.data,
      backgroundColor: node.backgroundColor,
      textColor: node.textColor,
      isTemporary: node.isTemporary,
      isEditing: node.isEditing,
      attachedFiles:
        node.data?.attachedFiles?.map((file: AttachedFile) => ({
          type: file.type,
          name: file.name,
          size: file.size,
          storagePath: file.storagePath,
          mimeType: file.mimeType,
          url: file.url,
          isFile: file.isFile
        })) || [],
      tasks: tasks,
      events: events,
      completedTasks: node.data?.completedTasks || 0,
      totalTasks: node.data?.totalTasks || 0,
      showCompletedTasks: node.data?.showCompletedTasks ?? true,
      showDueDate: node.data?.showDueDate ?? true,
      showPriority: node.data?.showPriority ?? true,
      sortBy: node.data?.sortBy || '',
      columns: columns,
      rows: rows,
      defaultColumnType: node.data?.defaultColumnType || 'text',
      dateFormat: node.data?.dateFormat || 'yyyy-MM-dd',
      tableSettings: tableSettings,
      ...processedData
    },
    width: node.isEditing
      ? (isDesktop
          ? (node.editWidth as number)
          : (node.mobileEditWidth as number)) || (node.viewWidth as number)
      : (node.viewWidth as number),
    height: node.isEditing
      ? (isDesktop
          ? (node.editHeight as number)
          : (node.mobileEditHeight as number)) || (node.viewHeight as number)
      : (node.viewHeight as number)
  };
};

const processEdge = (
  edge: Database['public']['Tables']['edges']['Row']
): ReactFlowEdge => ({
  id: edge.id,
  source: edge.source_node_id || '',
  target: edge.target_node_id || '',
  type: 'customEdge'
});

const useCanvasStore = create<CanvasState>()(
  devtools((set, get) => {
    let previousNodes: ReactFlowNode[] = [];
    let previousEdges: ReactFlowEdge[] = [];

    return {
      canvasId: uuidv4(),
      isLoading: false,
      lastLoadTime: 0,
      setCanvasId: (id) => set({ canvasId: id }),
      saveCanvas: async () => {
        const { canvasId } = get();
        const { nodes } = useNodeStore.getState();
        const { edges } = useEdgeStore.getState();

        if (
          JSON.stringify(nodes) !== JSON.stringify(previousNodes) ||
          JSON.stringify(edges) !== JSON.stringify(previousEdges)
        ) {
          // Only save if there are changes
          previousNodes = nodes;
          previousEdges = edges;

          const canvasState: CanvasServiceState = {
            nodes: nodes as Node[],
            edges: edges.map((edge) => ({
              canvas_id: canvasId,
              created_at: new Date().toISOString(),
              id: edge.id,
              source_node_id: edge.source,
              target_node_id: edge.target,
              updated_at: new Date().toISOString()
            }))
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

          const nodes = await Promise.all(
            canvasData.nodes.map(async (node) => {
              const processedNode = await processNode(node as Partial<Node>);
              return processedNode;
            })
          );
          const edges = canvasData.edges.map(processEdge);

          useNodeStore
            .getState()
            .setNodes(
              nodes.filter((node): node is ReactFlowNode => node !== null)
            );
          useEdgeStore.getState().setEdges(edges);

          set({
            canvasId,
            lastLoadTime: Date.now(),
            isLoading: false
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
