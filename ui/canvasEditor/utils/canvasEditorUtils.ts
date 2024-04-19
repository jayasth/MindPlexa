import { Dispatch } from 'react';
import { CanvasEditorAction, Node } from '../canvasEditorReducer'; // Adjust the import path as necessary

// Function to handle adding a node
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
          y: viewportHeight / 2 - 100
        },
        data: {
          content: '',
          color: '',
          width: 0,
          height: 0
        }
      };
      break;
    case 'task':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'task',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 100
        },
        data: {
          task: '',
          completed: false,
          color: '',
          width: 0,
          height: 0
        }
      };
      break;
    case 'custom':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 100
        },
        data: {}
      };
      break;
    case 'code':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'code',
        position: {
          x: viewportWidth / 2 - 100,
          y: viewportHeight / 2 - 100
        },
        data: {
          code: '', // Initialize as empty string or appropriate default
          language: '' // Initialize language
        }
      };
      break;
    case 'draw':
      newNode = {
        id: `node-${Date.now()}`,
        type: 'draw',
        position: { x: viewportWidth / 2 - 100, y: viewportHeight / 2 - 100 },
        data: {
          data: {}, // Initialize with empty or default drawing data
          color: '',
          width: 100, // Default width
          height: 100 // Default height
        }
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
      data: { ...nodeToUpdate.data, color }
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
      data: { ...nodeToUpdate.data, width, height }
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
        data: {
          ...node.data,
          completed: !node.data.completed
        }
      };
      dispatch({ type: 'UPDATE_NODE', payload: updatedNode });
    }
  }
};

// Function to handle downloading the canvas data
export const handleDownload = (state: any) => {
  const canvasData = {
    nodes: state.nodes,
    edges: state.edges
  };
  const json = JSON.stringify(canvasData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'canvas.json';
  link.click();
  URL.revokeObjectURL(url);
};

// Function to handle sharing the canvas
export const handleShare = (state: any) => {
  const canvasData = {
    nodes: state.nodes,
    edges: state.edges
  };
  const json = JSON.stringify(canvasData, null, 2);
  const url = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  window.open(url, '_blank');
};
