import type { Json } from '@/types_db';
import type { Tables } from '@/types_db';

export type Node = Tables<'base_nodes'>;

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface NoteNode extends Node {
  content: string | null;
}

export interface TaskNode extends Node {
  task: string | null;
  completed: boolean | null;
}

export interface CustomNode extends Node {
  title: string;
  data: Json | null;
}

export interface CodeNode extends Node {
  code: string | null;
  language: string | null;
}

export interface DrawNode extends Node {
  data: Json | null;
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
  | { type: 'CHANGE_NODE_COLOR'; payload: { id: string; color: string } }
  | {
      type: 'RESIZE_NODE';
      payload: { id: string; width: number; height: number };
    }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string };

const initialState: CanvasEditorState = {
  nodes: [],
  edges: [],
  currentVersion: 0,
  versions: []
};

export const canvasEditorReducer = (
  state: CanvasEditorState = initialState,
  action: CanvasEditorAction
): CanvasEditorState => {
  switch (action.type) {
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.payload)
      };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id ? { ...node, ...action.payload } : node
        )
      };
    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.payload] };
    case 'DELETE_EDGE':
      return {
        ...state,
        edges: state.edges.filter((edge) => edge.id !== action.payload)
      };
    case 'CHANGE_NODE_COLOR':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? { ...node, color: action.payload.color }
            : node
        )
      };
    case 'RESIZE_NODE':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload.id
            ? {
                ...node,
                width: action.payload.width,
                height: action.payload.height
              }
            : node
        )
      };
    case 'TOGGLE_TASK_COMPLETION':
      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === action.payload && 'completed' in node
            ? { ...node, completed: !node.completed }
            : node
        )
      };
    default:
      return state;
  }
};
