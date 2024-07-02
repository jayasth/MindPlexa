import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { v4 as uuidv4 } from 'uuid';
import type { Node, Edge, XYPosition } from 'reactflow';
import {
  nodeDimensions,
  getNodeSpecificProperties
} from '@/ui/canvasEditor/utils/nodeProperties';
import { Tables, TablesInsert, Database } from '@/types_db';
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
    nodeType: Database['public']['Enums']['node_type']
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
    type: Database['public']['Enums']['node_type']
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
  saveCanvasTimeout?: NodeJS.Timeout;
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
    console.log('Store: Setting nodes with updater:', updater);
    set((state) => {
      const updatedNodes =
        typeof updater === 'function' ? updater(state.nodes) : updater;
      state.nodeInternals.clear();
      updatedNodes.forEach((node) => {
        state.nodeInternals.set(node.id, node);
        if (node.position) {
          console.log(
            `Store: Node ${node.id} position updated to`,
            node.position
          );
        }
      });
      return { nodes: updatedNodes };
    });
  },
  setEdges: (updater) => {
    console.log('Store: Setting edges with updater:', updater);
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater
    }));
  },
  addNode: (node) => {
    console.log('Store: Adding node:', node);
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },
  updateNode: async (id, updates, specificUpdates, nodeType) => {
    try {
      const { data: updatedNode, error } = await updateNodeInDB(
        id,
        {
          ...updates,
          position: updates.position
            ? JSON.stringify(updates.position)
            : undefined,
          type: nodeType
        },
        specificUpdates,
        nodeType
      );

      if (error) {
        console.error('useCanvasStore: Error updating node:', error);
        return;
      }

      console.log('useCanvasStore: Updated node data:', updatedNode);

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
                  ...updatedNode,
                  backgroundColor: updatedNode.background_color,
                  textColor: updatedNode.text_color,
                  editWidth: updatedNode.edit_width || node.data.editWidth,
                  editHeight: updatedNode.edit_height || node.data.editHeight,
                  mobileEditWidth:
                    updatedNode.mobile_edit_width || node.data.mobileEditWidth,
                  mobileEditHeight:
                    updatedNode.mobile_edit_height || node.data.mobileEditHeight
                },
                width: updatedNode.view_width,
                height: updatedNode.view_height,
                isEditing: updatedNode.is_editing,
                isTemporary: updatedNode.is_temporary,
                parentNodeId: updatedNode.parent_node_id,
                zIndex: updatedNode.z_index
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
    console.log('Store: Adding edge:', edge);
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
    console.log('Store: Removing node with id:', id);
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    }));
  },
  removeEdge: async (id) => {
    await deleteEdgeInDB(id);
    console.log('Store: Removing edge with id:', id);
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
    console.log('Store: Updating edge with id:', id, 'and data:', data);
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
    console.log(
      'Store: Setting initial state with nodes:',
      nodes,
      'and edges:',
      edges
    );
    set(() => ({
      nodes,
      edges
    }));
  },
  addChildNode: (parentNode, position, type) => {
    console.log(
      'Store: Adding child node to parent node:',
      parentNode,
      'at position:',
      position,
      'with type:',
      type
    );
    set((state) => ({
      nodes: state.nodes.filter((node) => node.type !== 'selection_menu')
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
    console.log(
      'Store: Creating child node from drag for parent node:',
      parentNode,
      'at position:',
      position,
      'with type:',
      nodeType
    );
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
      id: `selection_menu-${uuidv4()}`,
      type: 'selection_menu' as Database['public']['Enums']['node_type'],
      position: childNodePosition,
      data: {
        onSelect: (selectedNodeType, selectedPosition) => {
          createNode(
            selectedNodeType,
            selectedPosition,
            nodes,
            (newNode) => {
              addNode(newNode);
              console.log('Store: Node created:', newNode);
              setEdges((edges) => [
                ...edges,
                {
                  id: `e-${uuidv4()}`,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                }
              ]);
              console.log('Store: Edge created:', {
                id: `e-${uuidv4()}`,
                source: parentNode.id,
                target: newNode.id,
                type: 'customEdge'
              });
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
      width: nodeDimensions['selection_menu'].width,
      height: nodeDimensions['selection_menu'].height
    };

    addNode(newNode);
    console.log('Store: Node added:', newNode);
    setEdges((edges) => [
      ...edges,
      {
        id: `e-${uuidv4()}`,
        source: parentNode.id,
        target: newNode.id,
        type: 'customEdge'
      }
    ]);
    console.log('Store: Edge created:', {
      id: `e-${uuidv4()}`,
      source: parentNode.id,
      target: newNode.id,
      type: 'customEdge'
    });
  },
  setShowNodeSelectionMenu: (show) => {
    console.log('Store: Setting show node selection menu to:', show);
    set(() => ({ showNodeSelectionMenu: show }));
  },
  setMenuPosition: (position) => {
    console.log('Setting menu position to:', position);
    set(() => ({ menuPosition: position }));
  },
  onNodesChange: (changes) => {
    set((state) => {
      if (
        state.isLoading ||
        (state.nodes.length === 0 && state.edges.length === 0)
      ) {
        console.log(
          'Store: Skipping onNodesChange due to loading or empty canvas'
        );
        return state;
      }

      changes.forEach((change) => {
        console.log(
          `Store: Node ${change.id} change of type '${change.type}' detected:`,
          change
        );
      });

      const updatedNodes = state.nodes
        .map((node) => {
          const change = changes.find((c) => c.id === node.id);
          if (change) {
            switch (change.type) {
              case 'position':
                if (
                  change.position &&
                  (change.position.x !== node.position.x ||
                    change.position.y !== node.position.y)
                ) {
                  // Immediately update the database
                  updateNodeInDB(
                    node.id,
                    { position: JSON.stringify(change.position) },
                    {},
                    node.type
                  );
                  return { ...node, position: change.position };
                }
                return node;
              case 'dimensions':
                if (node.isEditing && change.dimensions) {
                  const { editWidth, editHeight, mobileEditWidth, mobileEditHeight } = node.data;
                  const { width, height } = change.dimensions;
                  if (
                    width !== editWidth ||
                    height !== editHeight ||
                    width !== mobileEditWidth ||
                    height !== mobileEditHeight
                  ) {
                    // Immediately update the database
                    updateNodeInDB(
                      node.id,
                      {
                        edit_width: width,
                        edit_height: height
                      },
                      {},
                      node.type
                    );
                    return {
                      ...node,
                      width: width,
                      height: height,
                      data: {
                        ...node.data,
                        editWidth: width,
                        editHeight: height
                      }
                    };
                  }
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

      // Only save if there are actual changes
      const hasChanges =
        JSON.stringify(updatedNodes) !== JSON.stringify(state.nodes);
      if (hasChanges) {
        state.saveCanvas();
      }

      return {
        nodes: updatedNodes,
        edges: updatedEdges,
        nodeInternals: state.nodeInternals
      };
    });
  },
  onEdgesChange: (changes) => {
    console.log('Store: onEdgesChange :', changes);
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
  toggleEditMode: async (nodeId: string) => {
    console.log(`Store: Toggling edit mode for node ${nodeId}`);
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) {
      console.error(`Store: Node ${nodeId} not found`);
      return;
    }
    const newIsEditing = !node.isEditing;
    try {
      await updateNodeInDB(
        nodeId,
        { is_editing: newIsEditing },
        {},
        node.type as Database['public']['Enums']['node_type']
      );
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === nodeId ? { ...n, isEditing: newIsEditing } : n
        )
      }));
    } catch (error) {
      console.error(
        `Store: Error toggling edit mode for node ${nodeId}:`,
        error
      );
    }
  },
  setSelectedNodes: (selectedIds) => {
    console.log('Store: Setting selected nodes:', selectedIds);
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: selectedIds.includes(node.id)
      }))
    }));
  },
  setCanvasId: (id) => {
    console.log('Store: Setting canvas ID to:', id);
    set(() => ({ canvasID: id }));
  },
  saveCanvas: async () => {
    const { nodes, edges, canvasID, isLoading, lastLoadTime } = get();

    // Skip saving if loading, recently loaded, or canvas is empty
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

    // Check if there are any changes to save
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
        view_width: node.width || 0,
        view_height: node.height || 0,
        edit_width: node.data?.editWidth || null,
        edit_height: node.data?.editHeight || null,
        mobile_edit_width: node.data?.mobileEditWidth || null,
        mobile_edit_height: node.data?.mobileEditHeight || null,
        is_editing: node.isEditing || false,
        is_temporary: node.data?.isTemporary || false,
        parent_node_id: node.data?.parentNodeId || null,
        z_index: node.zIndex || 0
      })),
      node_specific_data: nodes
        .map((node) => {
          switch (node.type) {
            case 'note':
              return {
                node_id: node.id,
                content: node.data?.noteData?.content || ''
              };
            case 'task':
              return {
                node_id: node.id,
                tasks: JSON.stringify(node.data?.taskData || {})
              };
            case 'table':
              return {
                node_id: node.id,
                columns: JSON.stringify(node.data?.tableData?.columns || []),
                rows: JSON.stringify(node.data?.tableData?.rows || [])
              };
            case 'calendar':
              return {
                node_id: node.id,
                events: JSON.stringify(node.data?.calendarData?.events || []),
                view: node.data?.calendarData?.view || 'month'
              };
            case 'draw':
              return {
                node_id: node.id,
                drawing_data: JSON.stringify(node.data?.drawData || '')
              };
            default:
              return null;
          }
        })
        .filter(Boolean),
      node_canvas_link: nodes.map((node) => ({
        node_id: node.id,
        canvas_id: canvasID
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source_node_id: edge.source,
        target_node_id: edge.target,
        canvas_id: canvasID
      }))
    };

    console.log('Store: saveCanvas full canvasData:', canvasData);

    const result = await saveCanvasState(
      canvasID,
      canvasData.nodes,
      canvasData.edges
    );
    if (result.error) {
      console.error('Store: Error saving canvas data:', result.error);
      return;
    }

    console.log('Store: Canvas data saved successfully');
  },
  // Function to load canvas data
  loadCanvas: async (canvasId: string) => {
    set({ isLoading: true });
    console.log(`Store: Starting to load canvas with ID: ${canvasId}`);
    try {
      const { data, nodeData, error } = await fetchCanvas(canvasId);

      if (error) {
        console.error('Store: Error fetching canvas data:', error);
        set({ isLoading: false });
        return;
      }

      if (data && data.node_canvas_link && data.node_canvas_link.length > 0) {
        console.log('Store: Loading existing canvas data');
        const nodes = data.node_canvas_link
          .map((link) => {
            const node = link.nodes;
            if (!node) return null;

            const specificNodeData = nodeData?.[node.type]?.find(
              (specificNode) => specificNode.node_id === node.id
            );

            let position;
            try {
              position = JSON.parse(node.position);
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
        set({ nodes, edges, isLoading: false });
      } else {
        console.log('Store: Initializing new blank canvas');
        set({ nodes: [], edges: [], isLoading: false });
      }
    } catch (error) {
      console.error('Store: Error loading canvas:', error);
      set({ isLoading: false });
    }
  }
}));
export type { CanvasState };
