import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchCanvas,
  saveCanvasState
} from '@/utils/canvas/canvasDatabaseOperations';
import type { Node, Edge, XYPosition } from 'reactflow';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';

interface CanvasState {
  canvasID: string;
  nodes: Node[];
  edges: Edge[];
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setInitialState: (nodes: Node[], edges: Edge[]) => void;
  setCanvasId: (id: string) => void;
  saveCanvas: () => void;
  loadCanvas: (canvasId: string) => Promise<void>;
  isLoading: boolean;
  lastLoadTime: number;
}

const useCanvasStore = create<CanvasState>()(
  devtools((set, get) => ({
    canvasID: uuidv4(),
    nodes: [],
    edges: [],
    domNode: null,
    isLoading: false,
    lastLoadTime: 0,
    setDomNode: (node) => set({ domNode: node }),
    screenToFlowPosition: (position) => position,
    setNodes: (updater) => {
      set((state) => {
        const updatedNodes =
          typeof updater === 'function' ? updater(state.nodes) : updater;
        return { nodes: updatedNodes };
      });
    },
    setEdges: (updater) => {
      set((state) => ({
        edges: typeof updater === 'function' ? updater(state.edges) : updater
      }));
    },
    setInitialState: (nodes, edges) => {
      set(() => ({ nodes, edges }));
    },
    setCanvasId: (id) => set({ canvasID: id }),
    saveCanvas: async () => {
      const { nodes, edges, canvasID, isLoading, lastLoadTime } = get();

      if (
        isLoading ||
        Date.now() - lastLoadTime < 2000 ||
        (nodes.length === 0 && edges.length === 0)
      ) {
        console.log(
          'Store: Skipping save due to recent load, ongoing loading, or empty canvas'
        );
        return;
      }

      const hasChanges =
        nodes.some((node) => node.data?.isModified) ||
        edges.some((edge) => edge.data?.isModified);
      if (!hasChanges) {
        console.log('Store: No changes detected, skipping save');
        return;
      }

      const canvasData = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: JSON.stringify(node.position),
          title: node.data?.title || '',
          background_color: node.data?.backgroundColor || '#F4F4F4',
          text_color: node.data?.textColor || '#575757',
          view_width: node.width || 80,
          view_height: node.height || 150,
          edit_width: node.data?.edit_width || null,
          edit_height: node.data?.edit_height || null,
          mobile_edit_width: node.data?.mobile_edit_width || null,
          mobile_edit_height: node.data?.mobile_edit_height || null,
          isEditing: node.data?.isEditing || false,
          isTemporary: node.data?.isTemporary || false,
          parentNodeId: node.data?.parentNodeId || null,
          zIndex: node.data?.zIndex || 0
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          canvasId: canvasID
        }))
      };
      const result = await saveCanvasState(
        canvasID,
        canvasData.nodes.map((node) => ({
          ...node,
          type: node.type as
            | 'note'
            | 'task'
            | 'table'
            | 'calendar'
            | 'draw'
            | 'selection_menu'
        })),
        canvasData.edges
      );
      if (result.error) {
        console.error('Store: Error saving canvas data:', result.error);
        return;
      }

      console.log('Store: Canvas data saved successfully');
    },
    loadCanvas: async (canvasId: string) => {
      set({ isLoading: true });
      try {
        const { data, nodeData, error } = await fetchCanvas(canvasId);

        if (error) {
          console.error('Store: Error fetching canvas data:', error);
          set({ isLoading: false });
          return;
        }

        if (data && data.node_canvas_link && data.node_canvas_link.length > 0) {
          const nodes = data.node_canvas_link
            .map((link) => {
              const node = link.nodes;
              if (!node) return null;

              const specificNodeData = nodeData?.[node.type]?.find(
                (specificNode) => specificNode.node_id === node.id
              );

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

              return {
                id: node.id,
                type: node.type,
                position,
                data: {
                  ...node,
                  ...specificNodeData,
                  backgroundColor: node.background_color,
                  textColor: node.text_color
                },
                width: node.view_width,
                height: node.view_height,
                isEditing: node.is_editing
              };
            })
            .filter(
              (node): node is Node => node !== null && node.type !== undefined
            );

          const edges = data.edges
            ? data.edges.map((edge) => ({
                id: edge.id,
                source: edge.source_node_id || '',
                target: edge.target_node_id || '',
                type: 'customEdge'
              }))
            : [];
          set({ nodes, edges, isLoading: false, lastLoadTime: Date.now() });
        } else {
          set({
            nodes: [],
            edges: [],
            isLoading: false,
            lastLoadTime: Date.now()
          });
        }
      } catch (error) {
        console.error('Store: Error loading canvas:', error);
        set({ isLoading: false });
      }
    }
  }))
);

export default useCanvasStore;
