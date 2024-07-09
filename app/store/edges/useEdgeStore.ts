import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';
import {
  updateEdge as updateEdgeInDB,
  deleteEdge as deleteEdgeInDB
} from '@/utils/canvas/edgeService';
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
      set(
        produce((state: EdgeState) => {
          state.edges.push(edge);
        })
      );
      console.log('useEdgeStore: Edge added:', edge);
    },
    updateEdge: async (id, data) => {
      const previousEdges = get().edges;
      set(
        produce((state: EdgeState) => {
          const index = state.edges.findIndex((edge) => edge.id === id);
          if (index !== -1) {
            state.edges[index] = { ...state.edges[index], ...data };
          }
        })
      );
      try {
        const { error } = await updateEdgeInDB(id, data);
        if (error) {
          console.error(
            'useEdgeStore: Error updating edge in the database:',
            error
          );
          set({ edges: previousEdges });
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
        set({ edges: previousEdges });
      }
    },
    removeEdge: async (id) => {
      const previousEdges = get().edges;
      set(
        produce((state: EdgeState) => {
          state.edges = state.edges.filter((edge) => edge.id !== id);
        })
      );
      console.log('useEdgeStore: Removing edge with id:', id);
      try {
        const { error } = await deleteEdgeInDB(id);
        if (error) {
          console.error(
            'useEdgeStore: Error removing edge from the database:',
            error
          );
          set({ edges: previousEdges });
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
        set({ edges: previousEdges });
      }
    },
    setEdges: (updater) => {
      set(
        produce((state: EdgeState) => {
          state.edges =
            typeof updater === 'function' ? updater(state.edges) : updater;
        })
      );
    },
    onEdgesChange: (changes) => {
      set(
        produce((state: EdgeState) => {
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
          state.edges = updatedEdges;
        })
      );
    }
  }))
);

export default useEdgeStore;
