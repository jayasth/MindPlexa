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
import { Tables, TablesInsert } from '@/types_db';
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
    if (node.type === undefined) {
      console.error('Store: Node type is undefined');
      return;
    }
    const nodeProps = getNodeSpecificProperties(node.type, false);
    const textColor =
      node.data && node.data.backgroundColor
        ? parseInt(node.data.backgroundColor.replace('#', ''), 16) >
          0xffffff / 2
          ? '#575757'
          : '#F4F4F4'
        : '#575757';
    const toolbarColor = textColor === '#575757' ? '#F4F4F4' : '#575757';
    const newNode = {
      ...node,
      ...nodeProps,
      style: {
        backgroundColor: (node.data && node.data.backgroundColor) || '#F4F4F4',
        color: textColor
      },
      data: {
        ...node.data,
        backgroundColor: (node.data && node.data.backgroundColor) || '#F4F4F4',
        textColor: textColor,
        toolbarColor: toolbarColor
      }
    };

    const nodeTypeMapping = {
      note: 'note_nodes',
      task: 'task_nodes',
      table: 'table_nodes',
      calendar: 'calendar_nodes',
      draw: 'draw_nodes'
    };

    const tableName = nodeTypeMapping[node.type];
    if (tableName) {
      newNode.data = {
        ...newNode.data,
        ...(node.data as TablesInsert<typeof tableName>)
      };
    }

    console.log('Store: New node with position and dimensions:', newNode);
    set((state) => {
      const canvasSize = {
        width: state.domNode?.clientWidth || 1000,
        height: state.domNode?.clientHeight || 800
      };
      newNode.position = findOptimalPosition(state.nodes, canvasSize);
      state.nodeInternals.set(newNode.id, newNode);
      return { nodes: [...state.nodes, newNode] };
    });
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

      const updatedNodes = state.nodes
        .map((node) => {
          const change = changes.find((c) => c.id === node.id);
          if (change) {
            console.log(`Store: Node ${node.id} change detected:`, change);
            switch (change.type) {
              case 'position':
                return { ...node, position: change.position || node.position };
              case 'dimensions':
                // Only update dimensions if they actually changed and the node is editable
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

      // Debounce saveCanvas call
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
  toggleEditMode: (nodeId: string) => {
    console.log(`Store: Toggling edit mode for node ${nodeId}`);
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          console.log(`Store: Before toggling, isEditing is ${node.isEditing}`);
          return { ...node, isEditing: !node.isEditing };
        }
        return node;
      })
    }));
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

    // Prevent saving if we're still loading, if it's too soon after loading, or if the canvas is empty
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

    // Prepare canvas data for saving
    const canvasData = {
      nodes: nodes.map((node) => {
        console.log(`Store: Data for node ${node.id}:`, node.data);
        return {
          ...node.data
        };
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type
      }))
    };

    console.log(
      'Store: Saving canvas data:',
      JSON.stringify(canvasData, null, 2)
    );

    // Use saveCanvasState from canvasDatabaseOperations.ts to save the entire canvas state
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
    const { data, nodeData, error } = await fetchCanvas(canvasId);

    if (error) {
      console.error('Store: Error fetching canvas data:', error);
      set({ isLoading: false });
      return;
    }

    if (data) {
      const nodes = data.node_canvas_link
        ? data.node_canvas_link
            .map((link) => {
              const commonNode = link.common_node_properties;
              if (!commonNode) return null;

              const nodeType = commonNode.type;
              const specificNodeData = nodeData?.[nodeType]?.find(
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
                type: nodeType,
                position,
                data: {
                  ...commonNode,
                  ...specificNodeData
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

      set({ nodes, edges, lastLoadTime: Date.now(), isLoading: false });
    } else {
      console.log('Store: Initializing blank canvas');
      set({ nodes: [], edges: [], lastLoadTime: Date.now(), isLoading: false });
    }
  }
}));
export type { CanvasState };
