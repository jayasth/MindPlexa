// ui/canvasEditor/canvasEditorReducer.ts
import { produce } from 'immer';

export interface NoteNode {
  id: string;
  type: 'note';
  data: {
    content: string;
    color: string;
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface TaskNode {
  id: string;
  type: 'task';
  data: {
    task: string;
    completed: boolean;
    color: string;
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface CustomNode {
  id: string;
  type: 'custom';
  data: any;
  position: {
    x: number;
    y: number;
  };
}

export interface CodeNode {
  id: string;
  type: 'code';
  data: {
    code: string | null;
    language: string | null;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface DrawNode {
  id: string;
  type: 'draw';
  data: any;
  position: {
    x: number;
    y: number;
  };
}

export type Node = NoteNode | TaskNode | CustomNode | CodeNode | DrawNode;

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface CanvasEditorState {
  nodes: Node[];
  edges: Edge[];
  currentVersion: number;
  versions: CanvasEditorState[];
}

export type CanvasEditorAction =
  | { type: 'ADD_NODE'; payload: Node }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'UPDATE_NODE'; payload: Node }
  | { type: 'ADD_EDGE'; payload: Edge }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialState: CanvasEditorState = {
  nodes: [],
  edges: [],
  currentVersion: 0,
  versions: []
};

export const canvasEditorReducer = produce(
  (draft: CanvasEditorState, action: CanvasEditorAction) => {
    switch (action.type) {
      case 'ADD_NODE':
        draft.nodes.push(action.payload);
        break;
      case 'DELETE_NODE':
        draft.nodes = draft.nodes.filter((node) => node.id !== action.payload);
        break;
      case 'UPDATE_NODE':
        const nodeIndex = draft.nodes.findIndex(
          (node) => node.id === action.payload.id
        );
        if (nodeIndex !== -1) {
          draft.nodes[nodeIndex] = action.payload;
        }
        break;
      case 'ADD_EDGE':
        draft.edges.push(action.payload);
        break;
      case 'DELETE_EDGE':
        draft.edges = draft.edges.filter((edge) => edge.id !== action.payload);
        break;
      case 'UNDO':
        if (draft.currentVersion > 0) {
          draft.currentVersion--;
          const prevState = draft.versions[draft.currentVersion];
          draft.nodes = prevState.nodes;
          draft.edges = prevState.edges;
        }
        break;
      case 'REDO':
        if (draft.currentVersion < draft.versions.length - 1) {
          draft.currentVersion++;
          const nextState = draft.versions[draft.currentVersion];
          draft.nodes = nextState.nodes;
          draft.edges = nextState.edges;
        }
        break;
    }
  },
  initialState
);
