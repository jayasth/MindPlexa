import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  createEdge as createEdgeInDB,
  updateEdge as updateEdgeInDB,
  deleteEdge as deleteEdgeInDB
} from '@/utils/canvas/nodeEdgeDatabaseOperations';
import type { Edge } from 'reactflow';

interface EdgeState {
  edges: Edge[];
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  removeEdge: (id: string) => void;
  setEdges: (updater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onEdgesChange: (changes: any) => void;
}

const useEdgeStore = create<EdgeState>()(
  devtools((set, get) => ({
    edges: [],
    addEdge: (edge) => {
      const newEdge = { ...edge, id: uuidv4() };
      set((state) => ({ edges: [...state.edges, newEdge] }));
      createEdgeInDB(newEdge)
        .then(() => console.log('Edge added successfully to the database'))
        .catch((error) =>
          console.error('Error adding edge to the database:', error)
        );
    },
    updateEdge: (id, data) => {
      set((state) => ({
        edges: state.edges.map((edge) =>
          edge.id === id ? { ...edge, ...data } : edge
        )
      }));
      updateEdgeInDB(id, data)
        .then(() => console.log('Edge updated successfully in the database'))
        .catch((error) =>
          console.error('Error updating edge in the database:', error)
        );
    },
    removeEdge: (id) => {
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== id)
      }));
      deleteEdgeInDB(id)
        .then(() => console.log('Edge removed successfully from the database'))
        .catch((error) =>
          console.error('Error removing edge from the database:', error)
        );
    },
    setEdges: (updater) => {
      set((state) => ({
        edges: typeof updater === 'function' ? updater(state.edges) : updater
      }));
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
    }
  }))
);

export default useEdgeStore;
