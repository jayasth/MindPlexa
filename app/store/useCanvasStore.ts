import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import {
  updateNode,
  deleteNode,
  createEdge,
  updateEdge,
  deleteEdge
} from '@/utils/canvas/nodeEdgeDatabaseOperations';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { nanoid } from 'nanoid';
import type { Node, Edge, XYPosition } from 'reactflow';
import {
  nodeDimensions,
  getNodeSpecificProperties
} from '@/ui/canvasEditor/utils/nodeProperties';
import {
  NoteNodeData,
  TaskNodeData,
  TableNodeData,
  CalendarNodeData,
  DrawNodeData
} from '@/ui/canvasEditor/utils/nodeDatatypes';

import {
  saveCanvasState,
  fetchCanvas
} from '@/utils/canvas/canvasDatabaseOperations';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  nodeInternals: Map<string, Node>;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
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
  canvasId: string | null;
  setCanvasId: (canvasId: string | null) => void;
  saveCanvas: () => Promise<void>;
  loadCanvas: (canvasId: string) => Promise<void>;
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

const updateNodeData = (existingNode, data) => {
  const updatedNode = {
    ...existingNode,
    ...data,
    position: data.position || existingNode.position,
    data: {
      ...existingNode.data,
      ...data.data,
      backgroundColor:
        data.data?.backgroundColor || existingNode.data.backgroundColor,
      textColor: data.data?.textColor || existingNode.data.textColor,
      tags: data.data?.tags || existingNode.data.tags || [],
      attachedFiles:
        data.data?.attachedFiles || existingNode.data.attachedFiles || []
    }
  };

  switch (existingNode.type) {
    case 'note':
      updatedNode.data = {
        ...updatedNode.data,
        ...(data.data as NoteNodeData)
      };
      break;
    case 'task':
      updatedNode.data = {
        ...updatedNode.data,
        ...(data.data as TaskNodeData)
      };
      break;
    case 'table':
      updatedNode.data = {
        ...updatedNode.data,
        ...(data.data as TableNodeData)
      };
      break;
    case 'calendar':
      updatedNode.data = {
        ...updatedNode.data,
        ...(data.data as CalendarNodeData)
      };
      break;
    case 'draw':
      updatedNode.data = {
        ...updatedNode.data,
        ...(data.data as DrawNodeData)
      };
      break;
    // Add more cases for other node types if needed
    default:
      break;
  }

  return updatedNode;
};

export const useStore = createStore<CanvasState>((set, get) => ({
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
  canvasId: null,
  setCanvasId: (canvasId) => {
    set({ canvasId });
  },
  setNodes: (updater) => {
    console.log('Store: Setting nodes with updater:', updater);
    set((state) => {
      const updatedNodes =
        typeof updater === 'function' ? updater(state.nodes) : updater;
      state.nodeInternals.clear();
      if (updatedNodes) {
        updatedNodes.forEach((node) => {
          state.nodeInternals.set(node.id, node);
          if (node.position) {
            console.log(
              `Store: Node ${node.id} position updated to`,
              node.position
            );
          }
        });
      }
      return { nodes: updatedNodes || [] };
    });
  },
  setEdges: (updater) => {
    console.log('Store: Setting edges with updater:', updater);
    set((state) => ({
      edges: typeof updater === 'function' ? updater(state.edges) : updater
    }));
  },

  addNode: async (node) => {
    console.log('Store: Adding node:', node);
    if (node.type === undefined) {
      console.error('Node type is undefined');
      return;
    }

    const { canvasId, nodes, domNode } = get();
    if (!canvasId) {
      console.error('Canvas ID is not set');
      return;
    }

    const canvasSize = {
      width: domNode?.clientWidth || 1000,
      height: domNode?.clientHeight || 800
    };
    await createNode(
      node.type as
        | 'note'
        | 'task'
        | 'table'
        | 'calendar'
        | 'draw'
        | 'selectionMenu',
      node.position,
      nodes,
      (newNode) => {
        set((state) => ({
          nodes: [...state.nodes, newNode]
        }));
      },
      canvasSize,
      false,
      false,
      canvasId
    );
  },

  updateNode: async (id, data) => {
    console.log('Store: Updating node with id:', id, 'and data:', data);
    set(async (state) => {
      const existingNodeIndex = state.nodes.findIndex((node) => node.id === id);
      if (existingNodeIndex !== -1) {
        const existingNode = state.nodes[existingNodeIndex];
        const updatedNode = updateNodeData(existingNode, data);

        const updatedNodes = [...state.nodes];
        updatedNodes[existingNodeIndex] = updatedNode;
        state.nodeInternals.set(id, updatedNode);

        // Update the node in the database
        const { error } = await updateNode(
          id,
          updatedNode.data,
          updatedNode.data,
          updatedNode.type
        );

        if (error) {
          console.error('Error updating node in database:', error);
          return state;
        }

        return { nodes: updatedNodes };
      }
      return state;
    });
  },

  removeNode: async (id) => {
    console.log('Store: Removing node with id:', id);
    set(async (state) => {
      // Remove the node from the database
      const nodeToRemove = state.nodes.find((node) => node.id === id);
      if (nodeToRemove) {
        const { error } = await deleteNode(id, nodeToRemove.type);
        if (error) {
          console.error('Error deleting node from database:', error);
          return state;
        }
      }

      return {
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter(
          (edge) => edge.source !== id && edge.target !== id
        )
      };
    });
  },

  addEdge: async (edge) => {
    console.log('Store: Adding edge:', edge);
    set(async (state) => {
      const newEdge = { ...edge, id: nanoid() };

      // Save the new edge to the database
      const { data: createdEdge, error } = await createEdge(newEdge);
      if (error) {
        console.error('Error creating edge in database:', error);
        return state;
      }

      if (!createdEdge) {
        console.error('Error: createdEdge is undefined');
        return state;
      }

      return { edges: [...state.edges, { ...newEdge, id: createdEdge.id }] };
    });
  },
  updateEdge: async (id, data) => {
    console.log('Store: Updating edge with id:', id, 'and data:', data);
    set(async (state) => {
      const updatedEdges = state.edges.map((edge) => {
        if (edge.id === id) {
          return { ...edge, ...data };
        }
        return edge;
      });

      // Update the edge in the database
      const { error } = await updateEdge(id, data);
      if (error) {
        console.error('Error updating edge in database:', error);
        return state;
      }

      return { edges: updatedEdges };
    });
  },

  removeEdge: async (id) => {
    console.log('Store: Removing edge with id:', id);
    set(async (state) => {
      // Remove the edge from the database
      const { error } = await deleteEdge(id);
      if (error) {
        console.error('Error deleting edge from database:', error);
        return state;
      }

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
      id: nanoid(),
      type: type,
      data: { label: 'New Node' },
      position,
      style: {
        backgroundColor: '#F4F4F4',
        color: '#575757'
      }
    };

    const newEdge = {
      id: nanoid(),
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
      id: `selectionMenu-${nanoid()}`,
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
                  id: `e-${nanoid()}`,
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
        id: `e-${nanoid()}`,
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
    console.log('Store: Applying node changes:', changes);
    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes);
      return { nodes: updatedNodes };
    });
  },
  onEdgesChange: (changes) => {
    console.log('Applying edge changes:', changes);
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    }));
  },
  toggleEditMode: (nodeId: string) => {
    console.log(`Store: Toggling edit mode for node ${nodeId}`);
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          console.log(`Store: Before toggling, isEditing is ${node.isEditing}`);
          const updatedNode = { ...node, isEditing: !node.isEditing };
          console.log(
            `Store: After toggling, isEditing is ${updatedNode.isEditing}`
          );
          return updatedNode;
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
  saveCanvas: async () => {
    const { nodes, edges, canvasId } = get();
    if (canvasId) {
      const { error } = await saveCanvasState(canvasId, nodes, edges);
      if (error) {
        console.error('Error saving canvas state:', error);
      }
    }
  },
  loadCanvas: async (canvasId: string) => {
    const { data, error } = await fetchCanvas(canvasId);
    if (error) {
      console.error('Error loading canvas:', error);
      return;
    }
    if (data) {
      set({
        nodes: data.node_canvas_link.map((link) => link.common_node_properties),
        edges: data.edges
      });
    }
  }
}));

export type { CanvasState };
