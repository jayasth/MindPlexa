import type { Json } from '@/types_db';

export interface Node {
  id: string;
  type: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selectionMenu';
  position: { x: number; y: number };
  data: any;
  view_width: number;
  view_height: number;
  edit_width: number;
  edit_height: number;
  isEditing: boolean;
  draggable: boolean;
  connectable: boolean;
}

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

export interface TableNode extends Node {
  title: string;
  data: Json | null;
}

export interface CalendarNode extends Node {
  date: string | null;
  language: string | null;
}

export interface DrawNode extends Node {
  data: Json | null;
}

export interface NodeTypesState {
  nodes: Node[];
  edges: Edge[];
  currentVersion: number;
  versions: NodeTypesState[];
}

export type NodeTypesAction =
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
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'TOGGLE_EDIT_MODE'; payload: string };

const initialState: NodeTypesState = {
  nodes: [],
  edges: [],
  currentVersion: 0,
  versions: []
};

export const nodeTypesReducer = (
  state: NodeTypesState = initialState,
  action: NodeTypesAction
): NodeTypesState => {
  switch (action.type) {
    case 'ADD_NODE':
      console.log('Adding node:', action.payload);
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
                view_width: action.payload.width,
                view_height: action.payload.height
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
