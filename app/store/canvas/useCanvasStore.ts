import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchCanvas,
  saveCanvasState
} from '@/utils/canvas/canvasDatabaseOperations';
import type { Node } from 'reactflow';
import useNodeStore from '../nodes/useNodeStore';
import useEdgeStore from '../edges/useEdgeStore';
//import useUIStore from '../ui/useUIStore';

interface CanvasState {
  canvasID: string;
  setCanvasId: (id: string) => void;
  saveCanvas: () => Promise<void>;
  loadCanvas: (canvasId: string) => Promise<void>;
  isLoading: boolean;
  lastLoadTime: number;
  saveCanvasTimeout?: NodeJS.Timeout;
}

const useCanvasStore = create<CanvasState>()(
  devtools((set, get) => ({
    canvasID: uuidv4(),
    isLoading: false,
    lastLoadTime: 0,
    setCanvasId: (id) => set({ canvasID: id }),
    saveCanvas: async () => {
      const { canvasID, isLoading, lastLoadTime } = get();
      const nodes = useNodeStore.getState().nodes;
      const edges = useEdgeStore.getState().edges;

      if (
        isLoading ||
        Date.now() - lastLoadTime < 2000 ||
        (nodes.length === 0 && edges.length === 0)
      ) {
        console.log(
          'useCanvasStore: Skipping save due to recent load, ongoing loading, or empty canvas'
        );
        return;
      }

      const hasChanges =
        nodes.some((node) => node.data?.isModified) ||
        edges.some((edge) => edge.data?.isModified);
      if (!hasChanges) {
        console.log('useCanvasStore: No changes detected, skipping save');
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
          is_editing: node.data?.isEditing || false,
          is_temporary: node.data?.isTemporary || false,
          parent_node_id: node.data?.parentNodeId || null,
          z_index: node.data?.zIndex || 0
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source_node_id: edge.source,
          target_node_id: edge.target,
          canvas_id: canvasID
        }))
      };

      console.log('useCanvasStore: Node data before save:', canvasData.nodes);

      const result = await saveCanvasState(
        canvasID,
        canvasData.nodes as any,
        canvasData.edges
      );
      if (result.error) {
        console.error(
          'useCanvasStore: Error saving canvas data:',
          result.error
        );
        return;
      }

      console.log('useCanvasStore: Canvas data saved successfully');
    },
    loadCanvas: async (canvasId: string) => {
      set({ isLoading: true });
      try {
        const { data, nodeData, error } = await fetchCanvas(canvasId);

        if (error) {
          console.error('useCanvasStore: Error fetching canvas data:', error);
          set({ isLoading: false });
          return;
        }

        console.log('useCanvasStore: Fetched data:', data);
        console.log('useCanvasStore: Fetched nodeData:', nodeData);

        if (data && data.node_canvas_link && data.node_canvas_link.length > 0) {
          console.log('useCanvasStore: Loading existing canvas data');
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

          console.log('useCanvasStore: Edge data after load:', edges);

          useNodeStore.getState().setNodes(nodes);
          useEdgeStore.getState().setEdges(edges);
          set({ isLoading: false, lastLoadTime: Date.now() });
        } else {
          console.log('useCanvasStore: Initializing new blank canvas');
          useNodeStore.getState().setNodes([]);
          useEdgeStore.getState().setEdges([]);
          set({ isLoading: false, lastLoadTime: Date.now() });
        }
      } catch (error) {
        console.error('useCanvasStore: Error loading canvas:', error);
        set({ isLoading: false });
      }
    },
    saveCanvasTimeout: undefined
  }))
);

export default useCanvasStore;
