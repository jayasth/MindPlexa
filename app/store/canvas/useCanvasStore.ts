import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { fetchCanvas, saveCanvasState } from '@/utils/canvas/canvasService';
import type { Node } from 'reactflow';
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

const processNode = async (node: any) => {
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

  return {
    id: node.id,
    type: node.type,
    position,
    data: {
      ...node,
      ...node.data,
      backgroundColor: node.backgroundColor,
      textColor: node.textColor,
      isTemporary: node.isTemporary,
      isEditing: node.isEditing,
      attachedFiles:
        node.data?.attachedFiles?.map((file: any) => ({
          id: file.id,
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
      drawingFileUrl: node.data?.drawingFileUrl || node.drawingFileUrl || '',
      currentTool: node.data?.currentTool || '',
      settings: node.data?.settings || {},
      currentColor: node.data?.currentColor || '',
      currentStrokeWidth: node.data?.currentStrokeWidth || 0
    },
    width: node.isEditing
      ? (isDesktop ? node.editWidth : node.mobileEditWidth) || node.viewWidth
      : node.viewWidth,
    height: node.isEditing
      ? (isDesktop ? node.editHeight : node.mobileEditHeight) || node.viewHeight
      : node.viewHeight
  };
};

const processEdge = (edge: any) => ({
  id: edge.id,
  source: edge.sourceNodeId || '',
  target: edge.targetNodeId || '',
  type: 'customEdge'
});

const useCanvasStore = create<CanvasState>()(
  devtools((set, get) => {
    let previousNodes: Node[] = [];
    let previousEdges: any[] = [];

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

          useNodeStore.getState().setNodes(nodes);
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
