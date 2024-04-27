import { Node } from 'reactflow';
import { Dispatch, SetStateAction } from 'react';
import { handleAddNode } from './canvasEditorUtils';

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  position: { x: number; y: number },
  setNodes: Dispatch<SetStateAction<Node<any>[]>>
) => {
  handleAddNode(nodeType, setNodes, position);
};
