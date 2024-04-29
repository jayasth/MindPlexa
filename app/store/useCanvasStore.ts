import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges
} from '@/ui/canvasEditor/utils/canvasUtils';
import { nanoid } from 'nanoid';
import type { Node, Edge, XYPosition } from 'reactflow';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
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
}

const createStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return create(devtools(config));
};

export const useStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  showNodeSelectionMenu: false,
  menuPosition: null,
  setNodes: (updater) => set((state) => ({ nodes: updater(state.nodes) })),
  setEdges: (updater) => set((state) => ({ edges: updater(state.edges) })),
  addNode: (node) =>
    set((state) => {
      console.log('Store: Adding node', node);
      const newNode = { ...node, id: nanoid(), position: { x: 0, y: 0 } }; // Added default position
      console.log('New node with position:', newNode);
      return { nodes: [...state.nodes, newNode] };
    }),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...data } : node
      )
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
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id)
    })),
  setInitialState: (nodes, edges) =>
    set(() => ({
      nodes,
      edges
    })),
  addChildNode: (parentNode, position, type) => {
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
  createChildNodeFromDrag: (parentNode, position, type) => {
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
  setShowNodeSelectionMenu: (show) =>
    set(() => ({ showNodeSelectionMenu: show })),
  setMenuPosition: (position) => set(() => ({ menuPosition: position }))
}));

export type { CanvasState };
