import { Dispatch, SetStateAction } from 'react';
import type { Json, Tables } from '@/types_db';
import type {
  NoteNode,
  TaskNode,
  CustomNode,
  CodeNode,
  DrawNode
} from '@/ui/canvasEditor/canvasEditorReducer';
import { Node, XYPosition } from 'reactflow';

type BaseNode = Tables<'base_nodes'>;

export const handleAddNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  setNodes: Dispatch<SetStateAction<Node<any>[]>>,
  reactFlowWrapper: React.RefObject<HTMLDivElement>
) => {
  const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
  const position: XYPosition = reactFlowBounds
    ? {
        x: reactFlowBounds.width / 2,
        y: reactFlowBounds.height / 2
      }
    : { x: 0, y: 0 };

  const baseProperties: Partial<BaseNode> = {
    id: `${nodeType}-${Date.now()}`,
    type: nodeType,
    position: position as unknown as Json
  };

  let specificNode: Partial<
    NoteNode | TaskNode | CustomNode | CodeNode | DrawNode
  >;

  switch (nodeType) {
    case 'note':
      specificNode = {
        id: baseProperties.id, // Include id here
        ...baseProperties,
        content: '',
        title: 'New Note'
      } as Partial<NoteNode>;
      break;
    case 'task':
      specificNode = {
        id: baseProperties.id, // Include id here
        ...baseProperties,
        completed: false,
        task: 'New Task',
        title: 'New Task'
      } as Partial<TaskNode>;
      break;
    case 'custom':
      specificNode = {
        id: baseProperties.id, // Include id here
        ...baseProperties,
        data: {},
        title: 'New Custom Node'
      } as Partial<CustomNode>;
      break;
    case 'code':
      specificNode = {
        id: baseProperties.id, // Include id here
        ...baseProperties,
        code: '',
        language: 'plaintext',
        title: 'New Code'
      } as Partial<CodeNode>;
      break;
    case 'draw':
      specificNode = {
        id: baseProperties.id, // Include id here
        ...baseProperties,
        data: {},
        title: 'New Drawing'
      } as Partial<DrawNode>;
      break;
    default:
      throw new Error('Invalid node type');
  }

  const newNode: Node<any> = {
    ...specificNode,
    data: specificNode
  };

  setNodes((nds) => nds.concat(newNode));
};

// Function to handle downloading the canvas
export const handleDownload = (state: any) => {
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'canvas.json';
  link.click();
};

// Function to handle sharing the canvas
export const handleShare = (state: any) => {
  console.log('Sharing canvas:', state);
  // Add your sharing logic here
};
