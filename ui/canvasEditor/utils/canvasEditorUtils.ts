import { Dispatch } from 'react';
import {
  CanvasEditorAction,
  CanvasEditorState,
  Node
} from '../canvasEditorReducer';

export const handleAddNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  dispatch: Dispatch<CanvasEditorAction>,
  viewportWidth: number,
  viewportHeight: number
) => {
  let newNode: Node;
  switch (nodeType) {
    case 'note':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'note',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 150
        },
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        content: '',
        title: 'New Note'
      };
      break;
    case 'task':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'task',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 150
        },
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        task: '',
        completed: false,
        title: 'New Task'
      };
      break;
    case 'custom':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 150
        },
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        data: null,
        title: 'New Custom Node'
      };
      break;
    case 'code':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'code',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 150
        },
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        code: '',
        language: '',
        title: 'New Code Node'
      };
      break;
    case 'draw':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'draw',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 150
        },
        canvas_id: null,
        color: '#ffffff',
        created_at: null,
        updated_at: null,
        width: 200,
        height: 300,
        data: null,
        title: 'New Draw Node'
      };
      break;
  }

  dispatch({ type: 'ADD_NODE', payload: newNode });
};

// Function to handle deleting a node
export const handleDeleteNode = (
  nodeId: string,
  dispatch: Dispatch<CanvasEditorAction>
) => {
  dispatch({ type: 'DELETE_NODE', payload: nodeId });
};

// Function to handle changing node color
export const handleChangeNodeColor = (
  nodeId: string,
  color: string,
  nodes: Node[],
  dispatch: Dispatch<CanvasEditorAction>
) => {
  const nodeToUpdate = nodes.find((node) => node.id === nodeId);
  if (nodeToUpdate) {
    const updatedNode = {
      ...nodeToUpdate,
      color
    };
    dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
  }
};

// Function to handle resizing a node
export const handleResizeNode = (
  nodeId: string,
  width: number,
  height: number,
  nodes: Node[],
  dispatch: Dispatch<CanvasEditorAction>
) => {
  const nodeToUpdate = nodes.find((node) => node.id === nodeId);
  if (nodeToUpdate) {
    const updatedNode = {
      ...nodeToUpdate,
      width,
      height
    };
    dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
  }
};

// Function to toggle task completion
export const toggleTaskCompletion = (
  id: string,
  nodes: Node[],
  dispatch: Dispatch<CanvasEditorAction>
) => {
  const nodeIndex = nodes.findIndex((node) => node.id === id);
  if (nodeIndex !== -1) {
    const node = nodes[nodeIndex];
    if (node.type === 'task') {
      const updatedNode = {
        ...node,
        completed: !node.completed
      };
      dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
    }
  }
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
