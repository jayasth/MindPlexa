import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';
import type { Node, Edge, XYPosition } from 'reactflow';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  domNode: HTMLDivElement | null;
  setDomNode: (node: HTMLDivElement | null) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition;
  nodeInternals: Map<string, Node>;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
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
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = createStore<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  domNode: null,
  setDomNode: (node) => set({ domNode: node }),
  screenToFlowPosition: (position) => position,
  nodeInternals: new Map(),
  showNodeSelectionMenu: false,
  menuPosition: null,
  setNodes: (updater) => set((state) => ({ nodes: updater(state.nodes) })),
  setEdges: (updater) => set((state) => ({ edges: updater(state.edges) })),
  addNode: (node) =>
    set((state) => {
      console.log('Store: Adding node', node);
      const newNode = {
        ...node,
        id: nanoid(),
        draggable: true,
        connectable: true
      };
      console.log('Store: New node with position:', newNode);
      state.nodeInternals.set(newNode.id, newNode);
      return { nodes: [...state.nodes, newNode] };
    }),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === id) {
          const updatedNode = {
            ...node,
            ...data,
            position: data.position || node.position,
            width: data.width || node.width,
            height: data.height || node.height
          };
          state.nodeInternals.set(id, updatedNode);
          return updatedNode;
        }
        return node;
      })
    })),
  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, { ...edge, id: nanoid() }]
    })),
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      )
    })),
  removeEdge: (id) =>
    set((state) => {
      const updatedEdges = state.edges.filter((edge) => edge.id !== id);
      state.onEdgesChange([
        {
          type: 'remove',
          id: id
        }
      ]);
      return { edges: updatedEdges };
    }),
  setInitialState: (nodes, edges) =>
    set(() => ({
      nodes,
      edges
    })),
  addChildNode: (parentNode, position, type) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.type !== 'selectionMenu')
    }));

    const newNode = {
      id: nanoid(),
      type: type,
      data: { label: 'New Node' },
      position
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
    const {
      domNode,
      screenToFlowPosition,
      nodes,
      addNode,
      setEdges,
      removeNode
    } = get();

    if (!domNode) {
      console.error('DOM node is not available.');
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
      console.error('Failed to calculate child node position.');
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
            parentNode
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
  setShowNodeSelectionMenu: (show) =>
    set(() => ({ showNodeSelectionMenu: show })),
  setMenuPosition: (position) => set(() => ({ menuPosition: position })),
  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes)
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    })),
  toggleEditMode: (nodeId: string) => {
    console.log(`Toggling edit mode for node ${nodeId}`);
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          console.log(`Before toggling, isEditing is ${node.isEditing}`);
          return { ...node, isEditing: !node.isEditing };
        }
        return node;
      })
    }));
  }
}));

export type { CanvasState };
