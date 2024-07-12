import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { fetchCanvas, saveCanvasState } from '@/utils/canvas/canvasService';
import type { Node } from 'reactflow';
import useNodeStore from '../nodes/useNodeStore';
import useEdgeStore from '../edges/useEdgeStore';
import { produce } from 'immer';
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

const processNode = (node: any) => {
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
      isEditing: node.isEditing
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

const processNodeData = (nodeCanvasLink: any, nodeData: any) => {
  return (
    nodeCanvasLink
      ?.map((link: any) => processNode(link.nodes))
      .filter((node: any): node is Node => node !== null) || []
  );
};

const processEdgeData = (edges: any) => {
  return edges?.map(processEdge) || [];
};

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
          JSON.stringify(nodes) === JSON.stringify(previousNodes) &&
          JSON.stringify(edges) === JSON.stringify(previousEdges)
        ) {
          console.log('useCanvasStore: No changes detected, skipping save');
          return;
        }

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
      },
      loadCanvas: async (canvasId: string) => {
        set({ isLoading: true });

        try {
          const canvasData = await fetchCanvas(canvasId);
          console.log('useCanvasStore: Fetched canvas data:', canvasData);

          const nodes = canvasData.nodes.map((node) => processNode(node));
          console.log('useCanvasStore: Processed nodes:', nodes);

          useNodeStore.getState().setNodes(nodes);
          useEdgeStore.getState().setEdges(canvasData.edges || []);

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
