import { produce } from 'immer';

type Json = any;

export interface BaseNode {
  id: string;
  canvas_id: string | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
  position: Json;
  width: number | null;
  height: number | null;
}

export interface NoteNode extends BaseNode {
  type: 'note';
  content: string | null;
  title: string | null;
}

export interface TaskNode extends BaseNode {
  type: 'task';
  task: string | null;
  completed: boolean | null;
  title: string | null;
}

export interface CustomNode extends BaseNode {
  type: 'custom';
  data: Json;
  title: string | null;
}

export interface CodeNode extends BaseNode {
  type: 'code';
  code: string | null;
  language: string | null;
  title: string | null;
}

export interface DrawNode extends BaseNode {
  type: 'draw';
  data: Json;
  title: string | null;
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
  | { type: 'CHANGE_NODE_COLOR'; payload: { id: string; color: string } }
  | {
      type: 'RESIZE_NODE';
      payload: { id: string; width: number; height: number };
    }
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
        const index = draft.nodes.findIndex(
          (node) => node.id === action.payload.id
        );
        if (index !== -1) {
          draft.nodes[index] = action.payload;
        }
        break;
      case 'CHANGE_NODE_COLOR':
        const nodeIndex = draft.nodes.findIndex(
          (node) => node.id === action.payload.id
        );
        if (nodeIndex !== -1) {
          draft.nodes[nodeIndex].color = action.payload.color;
        }
        break;
      // Add more cases as necessary for other actions like resizing, updating position, etc.
      default:
        break;
    }
  },
  initialState
);
