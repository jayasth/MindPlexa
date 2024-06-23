import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import {
  createNode,
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
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { saveCanvasState } from '@/utils/canvas/canvasDatabaseOperations';

interface CanvasState {
  canvasID: string;
  nodes: Node[];
  edges: Edge[];
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  nodeInternals: Map<string, Node>;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (
    id: string,
    data: Partial<Node>,
    nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
  ) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (
    id: string,
    nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
  ) => void;
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
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = createStore<CanvasState>((set, get) => ({
  canvasID: nanoid(),
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
  setNodes: (updater) => {
    console.log('Store: Setting nodes with updater:', updater);
    set((state) => {
      const updatedNodes = updater(state.nodes);
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
    set((state) => ({ edges: updater(state.edges) }));
  },
  addNode: (node) => {
    console.log('Store: Adding node:', node);
    set((state) => {
      const canvasSize = {
        width: state.domNode?.clientWidth || 1000,
        height: state.domNode?.clientHeight || 800
      };
      node.position = findOptimalPosition(state.nodes, canvasSize);
      state.nodeInternals.set(node.id, node);
      return { nodes: [...state.nodes, node] };
    });
  },
  updateNode: async (id, data, nodeType) => {
    console.log('Store: Updating node with id:', id, 'and data:', data);
    set((state) => {
      const existingNodeIndex = state.nodes.findIndex((node) => node.id === id);
      if (existingNodeIndex !== -1) {
        const existingNode = state.nodes[existingNodeIndex];
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

        const updatedNodes = [...state.nodes];
        updatedNodes[existingNodeIndex] = updatedNode;
        state.nodeInternals.set(id, updatedNode);
        return { nodes: updatedNodes };
      }
      return state;
    });
    // Update the node in the database
    const { error } = await updateNode(
      id,
      { ...data, position: undefined },
      {},
      nodeType
    );
    if (error) {
      console.error('Store: Error updating node in database:', error);
    }
  },
  removeNode: async (id, nodeType) => {
    console.log('Store: Removing node with id:', id);
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    }));

    // Delete the node from the database
    const { error } = await deleteNode(id, nodeType);
    if (error) {
      console.error('Store: Error deleting node from database:', error);
    }
  },
  addEdge: async (edge) => {
    console.log('Store: Adding edge:', edge);
    set((state) => ({
      edges: [...state.edges, { ...edge, id: nanoid() }]
    }));

    // Save the new edge to the database
    const { data: createdEdge, error } = await createEdge(edge);
    if (error) {
      console.error('Store: Error creating edge in database:', error);
    }
  },
  updateEdge: async (id, data) => {
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

    // Update the edge in the database
    const { error } = await updateEdge(id, data);
    if (error) {
      console.error('Store: Error updating edge in database:', error);
    }
  },
  removeEdge: async (id) => {
    console.log('Store: Removing edge with id:', id);
    set((state) => {
      const updatedEdges = state.edges.filter((edge) => edge.id !== id);
      state.onEdgesChange([{ type: 'remove', id }]);
      return { edges: updatedEdges };
    });

    // Delete the edge from the database
    const { error } = await deleteEdge(id);
    if (error) {
      console.error('Store: Error deleting edge from database:', error);
    }
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
        onSelect: async (selectedNodeType, selectedPosition) => {
          const { data: createdNode, error } = await createNode(
            parentNode.id,
            selectedNodeType,
            selectedPosition,
            { id: nanoid(), viewWidth: 0, viewHeight: 0, isTemporary: false }
          );
          if (error) {
            console.error('Error creating node:', error);
            return;
          }
          addNode(createdNode);
          setEdges((edges) => [
            ...edges,
            {
              id: `e-${nanoid()}`,
              source: parentNode.id,
              target: createdNode.id,
              type: 'customEdge'
            }
          ]);
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
    const { nodes, edges, canvasID } = get();
    const canvasData = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type
      }))
    };
    console.log('Store: Saving canvas data:', canvasData);

    // Save the canvas state to the database
    const { error } = await saveCanvasState(
      canvasID,
      canvasData.nodes,
      canvasData.edges
    );
    if (error) {
      console.error('Store: Error saving canvas state to database:', error);
    }
  }
}));

export type { CanvasState };
