import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { fetchCanvas, saveCanvasState } from '@/utils/canvas/canvasService';
import type { Node, Edge } from 'reactflow';
import useNodeStore from '../nodes/useNodeStore';
import useEdgeStore from '../edges/useEdgeStore';
import { enableMapSet } from 'immer';

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

interface FileData {
  id: string;
  type: string;
  name: string;
  size: number;
  storagePath: string;
  mimeType: string;
  url: string;
  isFile: boolean;
}

interface NodeData {
  [key: string]: unknown;
  backgroundColor?: string;
  textColor?: string;
  isTemporary?: boolean;
  isEditing?: boolean;
  attachedFiles?: FileData[];
  tasks?: unknown[];
  events?: unknown[];
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
  columns?: unknown[];
  rows?: unknown[];
  defaultColumnType?: string;
  dateFormat?: string;
  tableSettings?: Record<string, unknown>;
}

const processNode = async (node: unknown): Promise<Node | null> => {
  if (!node || typeof node !== 'object') return null;

  const typedNode = node as Record<string, unknown>;
  console.log('useCanvasStore: Processing node:', typedNode);

  let position: { x: number; y: number };
  try {
    position =
      typeof typedNode.position === 'string'
        ? JSON.parse(typedNode.position)
        : (typedNode.position as { x: number; y: number });
  } catch (error) {
    console.error('Error parsing position JSON:', error);
    position = { x: 200, y: 200 };
  }

  const isDesktop = window.innerWidth >= 768;

  // Parse tasks JSON string if it exists
  let tasks: unknown[] = [];
  if (
    typedNode.type === 'task' &&
    typedNode.data &&
    (typedNode.data as Record<string, unknown>).tasks
  ) {
    try {
      tasks =
        typeof (typedNode.data as Record<string, unknown>).tasks === 'string'
          ? JSON.parse(
              (typedNode.data as Record<string, unknown>).tasks as string
            )
          : ((typedNode.data as Record<string, unknown>).tasks as unknown[]);
    } catch (error) {
      console.error('Error parsing tasks JSON:', error);
    }
  }

  // Parse events JSON string if it exists
  let events: unknown[] = [];
  if (
    typedNode.type === 'calendar' &&
    typedNode.data &&
    (typedNode.data as Record<string, unknown>).events
  ) {
    try {
      events =
        typeof (typedNode.data as Record<string, unknown>).events === 'string'
          ? JSON.parse(
              (typedNode.data as Record<string, unknown>).events as string
            )
          : ((typedNode.data as Record<string, unknown>).events as unknown[]);
    } catch (error) {
      console.error('Error parsing events JSON:', error);
    }
  }

  // Parse columns and rows JSON strings if they exist
  let columns: unknown[] = [],
    rows: unknown[] = [],
    tableSettings: Record<string, unknown> = {};
  if (typedNode.type === 'table' && typedNode.data) {
    try {
      columns = (typedNode.data as Record<string, unknown>).columns
        ? JSON.parse(
            (typedNode.data as Record<string, unknown>).columns as string
          )
        : [];
      rows = (typedNode.data as Record<string, unknown>).rows
        ? JSON.parse((typedNode.data as Record<string, unknown>).rows as string)
        : [];
      tableSettings = (typedNode.data as Record<string, unknown>).settings
        ? JSON.parse(
            (typedNode.data as Record<string, unknown>).settings as string
          )
        : {};
    } catch (error) {
      console.error('Error parsing table data JSON:', error);
    }
  }

  const nodeData: NodeData = {
    ...typedNode,
    ...(typedNode.data as Record<string, unknown>),
    backgroundColor: typedNode.backgroundColor as string | undefined,
    textColor: typedNode.textColor as string | undefined,
    isTemporary: typedNode.isTemporary as boolean | undefined,
    isEditing: typedNode.isEditing as boolean | undefined,
    attachedFiles: Array.isArray(
      (typedNode.data as Record<string, unknown>)?.attachedFiles
    )
      ? (
          (typedNode.data as Record<string, unknown>)
            .attachedFiles as Array<unknown>
        )?.map((file: unknown) => ({
          id: (file as FileData).id,
          type: (file as FileData).type,
          name: (file as FileData).name,
          size: (file as FileData).size,
          storagePath: (file as FileData).storagePath,
          mimeType: (file as FileData).mimeType,
          url: (file as FileData).url,
          isFile: (file as FileData).isFile
        }))
      : [],
    tasks: tasks,
    events: events,
    completedTasks:
      ((typedNode.data as Record<string, unknown>)?.completedTasks as number) ||
      0,
    totalTasks:
      ((typedNode.data as Record<string, unknown>)?.totalTasks as number) || 0,
    showCompletedTasks:
      ((typedNode.data as Record<string, unknown>)
        ?.showCompletedTasks as boolean) ?? true,
    showDueDate:
      ((typedNode.data as Record<string, unknown>)?.showDueDate as boolean) ??
      true,
    showPriority:
      ((typedNode.data as Record<string, unknown>)?.showPriority as boolean) ??
      true,
    sortBy:
      ((typedNode.data as Record<string, unknown>)?.sortBy as string) || '',
    drawingFileUrl:
      ((typedNode.data as Record<string, unknown>)?.drawingFileUrl as string) ||
      (typedNode.drawingFileUrl as string) ||
      '',
    currentTool:
      ((typedNode.data as Record<string, unknown>)?.currentTool as string) ||
      '',
    settings:
      ((typedNode.data as Record<string, unknown>)?.settings as Record<
        string,
        unknown
      >) || {},
    currentColor:
      ((typedNode.data as Record<string, unknown>)?.currentColor as string) ||
      '',
    currentStrokeWidth:
      ((typedNode.data as Record<string, unknown>)
        ?.currentStrokeWidth as number) || 0,
    columns: columns,
    rows: rows,
    defaultColumnType:
      ((typedNode.data as Record<string, unknown>)
        ?.defaultColumnType as string) || 'text',
    dateFormat:
      ((typedNode.data as Record<string, unknown>)?.dateFormat as string) ||
      'yyyy-MM-dd',
    tableSettings: tableSettings
  };

  return {
    id: typedNode.id as string,
    type: typedNode.type as string,
    position,
    data: nodeData,
    width: typedNode.isEditing
      ? ((isDesktop ? typedNode.editWidth : typedNode.mobileEditWidth) as
          | number
          | undefined) || (typedNode.viewWidth as number)
      : (typedNode.viewWidth as number),
    height: typedNode.isEditing
      ? ((isDesktop ? typedNode.editHeight : typedNode.mobileEditHeight) as
          | number
          | undefined) || (typedNode.viewHeight as number)
      : (typedNode.viewHeight as number)
  };
};

const processEdge = (edge: unknown): Edge => ({
  id: (edge as Record<string, unknown>).id as string,
  source: ((edge as Record<string, unknown>).sourceNodeId as string) || '',
  target: ((edge as Record<string, unknown>).targetNodeId as string) || '',
  type: 'customEdge'
});

const useCanvasStore = create<CanvasState>()(
  devtools((set, get) => {
    let previousNodes: Node[] = [];
    let previousEdges: Edge[] = [];

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

          const canvasState = {
            nodes,
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

          useNodeStore
            .getState()
            .setNodes(nodes.filter((node): node is Node => node !== null));
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
