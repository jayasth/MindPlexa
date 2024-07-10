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

const processNode = (node: any, nodeData: any) => {
  if (!node) return null;

  console.log('useCanvasStore: Processing node:', node);

  let specificNodeData = {};
  if (node.type !== 'selection_menu') {
    specificNodeData =
      nodeData?.[node.type]?.find(
        (specificNode) => specificNode.nodeId === node.id
      ) || {};
  }

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

  const isDesktop = window.innerWidth >= 768; // Assuming 768px as the breakpoint

  const dimensions = {
    viewWidth: node.viewWidth,
    viewHeight: node.viewHeight,
    editWidth: node.editWidth,
    editHeight: node.editHeight,
    mobileEditWidth: node.mobileEditWidth,
    mobileEditHeight: node.mobileEditHeight
  };

  return {
    id: node.id,
    type: node.type,
    position,
    data: {
      ...node,
      ...specificNodeData,
      backgroundColor: node.backgroundColor,
      textColor: node.textColor,
      isTemporary: node.isTemporary,
      isEditing: node.isEditing,
      ...dimensions
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
      ?.map((link: any) => processNode(link.nodes, nodeData))
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
        if (get().isLoading || get().saveCanvasTimeout) return;
        const { canvasId, lastLoadTime } = get();
        const nodes = useNodeStore.getState().nodes;
        const edges = useEdgeStore.getState().edges;

        if (
          Date.now() - lastLoadTime < 2000 ||
          (nodes.length === 0 && edges.length === 0)
        ) {
          console.log(
            'useCanvasStore: Skipping save due to recent load or empty canvas'
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

        if (
          JSON.stringify(nodes) === JSON.stringify(previousNodes) &&
          JSON.stringify(edges) === JSON.stringify(previousEdges)
        ) {
          console.log(
            'useCanvasStore: No actual changes in nodes or edges, skipping save'
          );
          return;
        }

        console.log('useCanvasStore: Node data before save:', nodes);

        const canvasData = {
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: JSON.stringify(node.position),
            title: node.data?.title || '',
            backgroundColor: node.data?.backgroundColor || '#F4F4F4',
            textColor: node.data?.textColor || '#575757',
            viewWidth: node.data?.viewWidth,
            viewHeight: node.data?.viewHeight,
            editWidth: node.data?.editWidth,
            editHeight: node.data?.editHeight,
            mobileEditWidth: node.data?.mobileEditWidth,
            mobileEditHeight: node.data?.mobileEditHeight,
            isEditing: node.data?.isEditing || false,
            isTemporary: node.data?.isTemporary || false,
            parentNodeId: node.data?.parentNodeId || null,
            zIndex: node.data?.zIndex || 0,
            [node.type + 'Data']: node.data?.[node.type + 'Data'] || {}
          })),
          edges: edges.map((edge) => ({
            id: edge.id,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            canvasId: canvasId
          }))
        };

        console.log('useCanvasStore: Node data before save:', canvasData.nodes);

        const result = await saveCanvasState(
          canvasId,
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
        console.log('useCanvasStore: Node data after save:', nodes);

        useNodeStore.getState().setNodes(
          produce((nodes) => {
            nodes.forEach((node) => {
              const savedNode = canvasData.nodes.find((n) => n.id === node.id);
              if (savedNode) {
                Object.assign(node.data, savedNode);
                node.data.isModified = false;
              }
            });
          })
        );
        useEdgeStore.getState().setEdges(
          produce((edges) => {
            edges.forEach((edge) => {
              const savedEdge = canvasData.edges.find((e) => e.id === edge.id);
              if (savedEdge) {
                Object.assign(edge.data, savedEdge);
                edge.data.isModified = false;
              }
            });
          })
        );

        previousNodes = nodes;
        previousEdges = edges;

        console.log('useCanvasStore: Node data after state update:', nodes);
      },
      loadCanvas: async (canvasId: string) => {
        if (get().isLoading) return;
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

          if (data) {
            console.log('useCanvasStore: Loading existing canvas data');
            const nodes = processNodeData(data.nodeCanvasLink, nodeData);

            console.log('useCanvasStore: Nodes after processing:', nodes);

            const edges = processEdgeData(data.edges);

            console.log('useCanvasStore: Edge data after load:', edges);

            useNodeStore.getState().setNodes(nodes);
            useNodeStore.getState().setInitialState(nodes);
            useEdgeStore.getState().setEdges(edges);
          } else {
            console.log('useCanvasStore: Initializing new blank canvas');
            useNodeStore.getState().setNodes([]);
            useNodeStore.getState().setInitialState([]);
            useEdgeStore.getState().setEdges([]);
          }

          set({ isLoading: false, lastLoadTime: Date.now() });
        } catch (error) {
          console.error('useCanvasStore: Error loading canvas:', error);
          set({ isLoading: false });
        }
      }
    };
  })
);

export default useCanvasStore;
