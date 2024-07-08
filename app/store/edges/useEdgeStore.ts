import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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
    addEdge: async (edge) => {
      set((state) => ({ edges: [...state.edges, edge] }));
      console.log('useEdgeStore: Creating edge:', edge);
      try {
        const { error } = await createEdgeInDB(edge);
        if (error) {
          console.error(
            'useEdgeStore: Error adding edge to the database:',
            error
          );
        } else {
          console.log('useEdgeStore: Edge added successfully to the database');
        }
      } catch (error) {
        console.error(
          'useEdgeStore: Error adding edge to the database:',
          error
        );
      }
    },
    updateEdge: async (id, data) => {
      set((state) => ({
        edges: state.edges.map((edge) =>
          edge.id === id ? { ...edge, ...data } : edge
        )
      }));
      try {
        const { error } = await updateEdgeInDB(id, data);
        if (error) {
          console.error(
            'useEdgeStore: Error updating edge in the database:',
            error
          );
        } else {
          console.log(
            'useEdgeStore: Edge updated successfully in the database'
          );
        }
      } catch (error) {
        console.error(
          'useEdgeStore: Error updating edge in the database:',
          error
        );
      }
    },
    removeEdge: async (id) => {
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== id)
      }));
      try {
        const { error } = await deleteEdgeInDB(id);
        if (error) {
          console.error(
            'useEdgeStore: Error removing edge from the database:',
            error
          );
        } else {
          console.log(
            'useEdgeStore: Edge removed successfully from the database'
          );
        }
      } catch (error) {
        console.error(
          'useEdgeStore: Error removing edge from the database:',
          error
        );
      }
    },
    setEdges: (updater) => {
      set((state) => ({
        edges: typeof updater === 'function' ? updater(state.edges) : updater
      }));
    },
    onEdgesChange: (changes) => {
      set((state) => {
        const updatedEdges = state.edges
          .map((edge) => {
            const change = changes.find((change) => change.id === edge.id);
            if (change) {
              switch (change.type) {
                case 'remove':
                  return null;
                default:
                  return { ...edge, ...change };
              }
            }
            return edge;
          })
          .filter(Boolean);
        return { edges: updatedEdges };
      });
    }
  }))
);

export default useEdgeStore;
