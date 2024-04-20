import { Dispatch } from 'react';
import {
  CanvasEditorAction,
  Node,
  NoteNode,
  TaskNode,
  CustomNode,
  CodeNode,
  DrawNode,
  CanvasEditorState
} from '../canvasEditorReducer';
import { useReactFlow } from 'reactflow';

export const handleAddNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  dispatch: Dispatch<CanvasEditorAction>,
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  reactFlowInstance: any // Add this parameter to access React Flow instance methods
) => {
  if (!reactFlowWrapper.current) {
    console.error('React Flow wrapper is not available.');
    return;
  }

  const canvasRect = reactFlowWrapper.current.getBoundingClientRect();
  if (!canvasRect) {
    console.error('Unable to get canvas rectangle.');
    return;
  }

  const centerViewport = {
    x: canvasRect.width / 2,
    y: canvasRect.height / 2
  };
  const centerCanvas = reactFlowInstance.project(centerViewport); // Convert viewport position to canvas position

  let newNode: Node;

  switch (nodeType) {
    case 'note':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'note',
        position: centerCanvas, // Use the converted position
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        content: '',
        title: `New Note Node`
      } as NoteNode;
      break;
    case 'task':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'task',
        position: centerCanvas,
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        task: '',
        completed: false,
        title: `New Task Node`
      } as TaskNode;
      break;
    case 'custom':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: centerCanvas,
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        data: {},
        title: `New Custom Node`
      } as CustomNode;
      break;
    case 'code':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'code',
        position: centerCanvas,
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        code: '',
        language: '',
        title: `New Code Node`
      } as CodeNode;
      break;
    case 'draw':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'draw',
        position: centerCanvas,
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        data: {},
        title: `New Draw Node`
      } as DrawNode;
      break;
    default:
      throw new Error('Unsupported node type');
  }

  dispatch({ type: 'ADD_NODE', payload: newNode });
};

// Function to handle downloading the canvas
export const handleDownload = (state: CanvasEditorState) => {
  // Implement the logic to download the canvas state
  // You can convert the state to a JSON string and create a downloadable file
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'canvas.json';
  link.click();
};

// Function to handle sharing the canvas
export const handleShare = (state: CanvasEditorState) => {
  // Implement the logic to share the canvas
  // You can use an API or service to share the canvas state
  console.log('Sharing canvas:', state);
  // Add your sharing logic here
};
