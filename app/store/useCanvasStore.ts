import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { v4 as uuidv4 } from 'uuid';
import type { Node, Edge, XYPosition } from 'reactflow';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import {
  fetchCanvas,
  saveCanvasState
} from '@/utils/canvas/canvasDatabaseOperations';
import {
  updateNode as updateNodeInDB,
  deleteNode as deleteNodeInDB,
  createEdge as createEdgeInDB,
  updateEdge as updateEdgeInDB,
  deleteEdge as deleteEdgeInDB
} from '@/utils/canvas/nodeEdgeDatabaseOperations';

interface CanvasState {
  canvasID: string;
  nodes: Node[];
  edges: Edge[];
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  nodeInternals: Map<string, Node>;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  updateNode: (
    id: string,
    updates: Partial<Node>,
    specificUpdates: any,
    nodeType: string
  ) => Promise<void>;
  addEdge: (edge: Edge) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  setInitialState: (nodes: Node[], edges: Edge[]) => void;
  addChildNode: (parentNode: Node, position: XYPosition, type: string) => void;
  createChildNodeFromDrag: (
    parentNode: Node,
    position: XYPosition,
    type: string
  ) => void;
  showNodeSelectionMenu: boolean;
  setShowNodeSelectionMenu: (show: boolean) => void;
  menuPosition: XYPosition | null;
  setMenuPosition: (position: XYPosition | null) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  toggleEditMode: (nodeId: string) => void;
  setSelectedNodes: (selectedIds: string[]) => void;
  setCanvasId: (id: string) => void;
  saveCanvas: () => void;
  loadCanvas: (canvasId: string) => Promise<void>;
  isLoading: boolean;
  lastLoadTime: number;
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = createStore<CanvasState>((set, get) => ({
  canvasID: uuidv4(),
  nodes: [],
  edges: [],
  domNode: null,
  setDomNode: (node) => {
    set({ domNode: node });
  },
  screenToFlowPosition: (position) => {
    return position;
  },
  nodeInternals: new Map(),
  showNodeSelectionMenu: false,
  menuPosition: null,
  isLoading: false,
  lastLoadTime: 0,
  setNodes: (updater) => {
    set((state) => {
      const updatedNodes =
        typeof updater === 'function' ? updater(state.nodes) : updater;
      state.nodeInternals.clear();
      updatedNodes.forEach((node) => {
        state.nodeInternals.set(node.id, node);
      });
      return { nodes: updatedNodes };
    });
  },
  setEdges: (updater) => {
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater
    }));
  },
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },
  updateNode: async (id, updates, specificUpdates, nodeType) => {
    try {
      const updatesWithPosition = {
        ...updates,
        position: updates.position
          ? JSON.stringify(updates.position)
          : undefined,
        type: updates.type as
          | 'note'
          | 'task'
          | 'table'
          | 'calendar'
          | 'draw'
          | 'selectionMenu'
          | null
          | undefined
      };

      const { data: updatedNode, error } = await updateNodeInDB(
        id,
        updatesWithPosition,
        specificUpdates,
        nodeType as
          | 'note'
          | 'task'
          | 'table'
          | 'calendar'
          | 'draw'
          | 'selectionMenu'
      );

      if (error) {
        console.error('useCanvasStore: Error updating node:', error);
        return;
      }

      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                ...updatedNode,
                position: updatedNode.position
                  ? JSON.parse(updatedNode.position)
                  : node.position,
                data: {
                  ...node.data,
                  ...updatedNode.data
                }
              }
            : node
        )
      }));
    } catch (error) {
      console.error('useCanvasStore: Unexpected error updating node:', error);
    }
  },
  addEdge: async (edge) => {
    await createEdgeInDB(edge);
    set((state) => ({
      edges: [...state.edges, edge]
    }));
  },
  removeNode: async (id) => {
    const nodeToRemove = get().nodes.find((node) => node.id === id);
    if (!nodeToRemove) {
      console.error('Store: Node not found for removal:', id);
      return;
    }
    await deleteNodeInDB(id, nodeToRemove.type);
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    }));
  },
  removeEdge: async (id) => {
    await deleteEdgeInDB(id);
    set((state) => {
      const updatedEdges = state.edges.filter((edge) => edge.id !== id);
      state.onEdgesChange([
        {
          type: 'remove',
          id: id
        }
      ]);
      return { edges: updatedEdges };
    });
  },
  updateEdge: async (id, data) => {
    await updateEdgeInDB(id, data);
    set((state) => {
      const updatedEdges = state.edges.map((edge) => {
        if (edge.id === id) {
          return { ...edge, ...data };
        }
        return edge;
      });
      return { edges: updatedEdges };
    });
  },
  setInitialState: (nodes, edges) => {
    set(() => ({
      nodes,
      edges
    }));
  },
  addChildNode: (parentNode, position, type) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.type !== 'selectionMenu')
    }));

    const newNode = {
      id: uuidv4(),
      type: type,
      data: { label: 'New Node' },
      position,
      style: {
        backgroundColor: '#F4F4F4',
        color: '#575757'
      }
    };

    const newEdge = {
      id: uuidv4(),
      source: parentNode.id,
      target: newNode.id,
      type: 'customEdge'
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge]
    }));
  },
  createChildNodeFromDrag: (parentNode, position, nodeType) => {
    const {
      domNode,
      screenToFlowPosition,
      nodes,
      addNode,
      setEdges,
      removeNode
    } = get();

    if (!domNode) {
      console.error('Store: DOM node is not available.');
      return;
    }

    const flowPosition = screenToFlowPosition(position);
    const childNodePosition = getChildNodePosition(
      flowPosition,
      parentNode,
      domNode,
      screenToFlowPosition
    );
    if (!childNodePosition) {
      console.error('Store: Failed to calculate child node position.');
      return;
    }

    const newNode = {
      id: `selectionMenu-${uuidv4()}`,
      type: 'selectionMenu',
      position: childNodePosition,
      data: {
        onSelect: (selectedNodeType, selectedPosition) => {
          createNode(
            selectedNodeType,
            selectedPosition,
            nodes,
            (newNode) => {
              addNode(newNode);
              setEdges((edges) => [
                ...edges,
                {
                  id: `e-${uuidv4()}`,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                }
              ]);
            },
            { width: 0, height: 0 },
            false,
            false,
            parentNode.id
          );
          removeNode(newNode.id);
        },
        onClose: () => removeNode(newNode.id),
        parentNode: parentNode,
        isTemporary: true
      },
      width: nodeDimensions['selectionMenu'].width,
      height: nodeDimensions['selectionMenu'].height
    };

    addNode(newNode);
    setEdges((edges) => [
      ...edges,
      {
        id: `e-${uuidv4()}`,
        source: parentNode.id,
        target: newNode.id,
        type: 'customEdge'
      }
    ]);
  },
  setShowNodeSelectionMenu: (show) => {
    set(() => ({ showNodeSelectionMenu: show }));
  },
  setMenuPosition: (position) => {
    set(() => ({ menuPosition: position }));
  },
  onNodesChange: (changes) => {
    set((state) => {
      if (
        state.isLoading ||
        (state.nodes.length === 0 && state.edges.length === 0)
      ) {
        return state;
      }

      const updatedNodes = state.nodes
        .map((node) => {
          const change = changes.find((c) => c.id === node.id);
          if (change) {
            switch (change.type) {
              case 'position':
                return { ...node, position: change.position || node.position };
              case 'dimensions':
                if (
                  node.isEditing &&
                  change.dimensions &&
                  (change.dimensions.width !== node.width ||
                    change.dimensions.height !== node.height)
                ) {
                  return {
                    ...node,
                    width: change.dimensions.width,
                    height: change.dimensions.height
                  };
                }
                return node;
              case 'select':
                return { ...node, selected: change.selected };
              case 'remove':
                return null;
              default:
                return { ...node, ...change };
            }
          }
          return node;
        })
        .filter(Boolean);

      const removedNodeIds = changes
        .filter((c) => c.type === 'remove')
        .map((c) => c.id);

      removedNodeIds.forEach((id) => {
        state.nodeInternals.delete(id);
      });

      const updatedEdges = state.edges.filter(
        (edge) =>
          !removedNodeIds.includes(edge.source) &&
          !removedNodeIds.includes(edge.target)
      );

      if (state.saveCanvasTimeout) {
        clearTimeout(state.saveCanvasTimeout);
      }
      state.saveCanvasTimeout = setTimeout(() => {
        state.saveCanvas();
      }, 1000);

      return {
        nodes: updatedNodes,
        edges: updatedEdges,
        nodeInternals: state.nodeInternals
      };
    });
  },
  onEdgesChange: (changes) => {
    set((state) => {
      const updatedEdges = state.edges.map((edge) => {
        const change = changes.find((change) => change.id === edge.id);
        if (change) {
          return { ...edge, ...change };
        }
        return edge;
      });
      return { edges: updatedEdges };
    });
  },
  toggleEditMode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isEditing: !node.isEditing };
        }
        return node;
      })
    }));
  },
  setSelectedNodes: (selectedIds) => {
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: selectedIds.includes(node.id)
      }))
    }));
  },
  setCanvasId: (id) => {
    set(() => ({ canvasID: id }));
  },
  saveCanvas: async () => {
    const { nodes, edges, canvasID, isLoading, lastLoadTime } = get();

    if (
      isLoading ||
      Date.now() - lastLoadTime < 2000 ||
      (nodes.length === 0 && edges.length === 0)
    ) {
      return;
    }

    const canvasData = {
      nodes: nodes.map((node) => {
        const commonProperties = {
          id: node.id,
          type: node.type,
          position: JSON.stringify(node.position),
          title: node.data?.title || '',
          tags: node.data?.tags || [],
          attached_files: node.data?.attachedFiles || [],
          background_color: node.data?.backgroundColor || '#F4F4F4',
          text_color: node.data?.textColor || '#575757',
          view_width: node.width || 0,
          view_height: node.height || 0,
          edit_width: node.data?.editWidth || null,
          edit_height: node.data?.editHeight || null,
          is_editing: node.isEditing || false,
          is_temporary: node.data?.isTemporary || false,
          parent_node_id: node.data?.parentNodeId || null,
          z_index: node.zIndex || 0,
          created_at: node.data?.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          connectable: node.connectable !== false,
          draggable: node.draggable !== false
        };

        let specificData = {};
        let tableName = '';
        switch (node.type) {
          case 'note':
            specificData = {
              noteData: node.data?.noteData || {}
            };
            tableName = 'note_nodes';
            break;
          case 'task':
            specificData = {
              taskData: node.data?.taskData || {}
            };
            tableName = 'task_nodes';
            break;
          case 'calendar':
            specificData = {
              calendarData: node.data?.calendarData || {}
            };
            tableName = 'calendar_nodes';
            break;
          case 'table':
            specificData = {
              tableData: node.data?.tableData || {}
            };
            tableName = 'table_nodes';
            break;
          case 'draw':
            specificData = {
              drawData: node.data?.drawData || {}
            };
            tableName = 'draw_nodes';
            break;
          default:
            break;
        }

        return { ...commonProperties, ...specificData };
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type
      }))
    };

    const result = await saveCanvasState(
      canvasID,
      canvasData.nodes.map(({ tableName, ...node }) => node),
      canvasData.edges
    );

    if (result.error) {
      console.error('Store: Error saving canvas data:', result.error);
      return;
    }
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
          ? data.node_canvas_link
              .map((link) => {
                const commonNode = link.common_node_properties;
                if (!commonNode) return null;

                const specificNodeData = nodeData?.[commonNode.type]?.find(
                  (node) => node.common_node_id === commonNode.id
                );

                let position;
                try {
                  position = JSON.parse(commonNode.position);
                } catch (error) {
                  console.error('Error parsing position JSON:', error);
                  position = { x: 200, y: 200 };
                }

                if (
                  !position ||
                  typeof position.x !== 'number' ||
                  typeof position.y !== 'number'
                ) {
                  position = { x: 200, y: 200 };
                }

                return {
                  id: commonNode.id,
                  type: commonNode.type,
                  position,
                  data: {
                    ...commonNode,
                    ...specificNodeData,
                    backgroundColor: commonNode.background_color || '#F4F4F4',
                    textColor: commonNode.text_color || '#575757',
                    tags: commonNode.tags || [],
                    attachedFiles: commonNode.attached_files || []
                  },
                  width: commonNode.view_width || 80,
                  height: commonNode.view_height || 150,
                  isEditing: false
                };
              })
              .filter(
                (node): node is Node => node !== null && node.type !== undefined
              )
          : [];
        const edges = data.edges
          ? data.edges.map((edge) => ({
              id: edge.id,
              source: edge.source_node_id || '',
              target: edge.target_node_id || '',
              type: 'customEdge'
            }))
          : [];
        set({ nodes, edges, isLoading: false });
      } else {
        set({ nodes: [], edges: [], isLoading: false });
      }
    } catch (error) {
      console.error('Store: Error loading canvas:', error);
      set({ isLoading: false });
    }
  }
}));
export type { CanvasState };
