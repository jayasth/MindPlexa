import { Dispatch, SetStateAction } from 'react';
import type { Json, Tables } from '@/types_db';
import type {
  NoteNode,
  TaskNode,
  CustomNode,
  CodeNode,
  DrawNode
} from '@/ui/canvasEditor/canvasEditorReducer';

type BaseNode = Tables<'base_nodes'>;

export const handleAddNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  setNodes: Dispatch<SetStateAction<BaseNode[]>>,
  reactFlowWrapper: React.RefObject<HTMLDivElement>
) => {
  const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
  const position: Json = reactFlowBounds
    ? {
        x: reactFlowBounds.width / 2 - 100,
        y: reactFlowBounds.height / 2 - 50
      }
    : { x: 0, y: 0 };

  const baseProperties = {
    id: `${nodeType}-${Date.now()}`,
    canvas_id: null,
    color: 'lightblue', // Default color
    created_at: null,
    updated_at: null,
    height: 100,
    width: 200,
    position: position,
    type: nodeType
  };

  let specificNode: NoteNode | TaskNode | CustomNode | CodeNode | DrawNode;

  switch (nodeType) {
    case 'note':
      specificNode = {
        ...baseProperties,
        content: '',
        title: 'New Note'
      } as NoteNode;
      break;
    case 'task':
      specificNode = {
        ...baseProperties,
        completed: false,
        task: 'New Task',
        title: 'New Task'
      } as TaskNode;
      break;
    case 'custom':
      specificNode = {
        ...baseProperties,
        data: {},
        title: 'New Custom Node'
      } as CustomNode;
      break;
    case 'code':
      specificNode = {
        ...baseProperties,
        code: '',
        language: 'plaintext',
        title: 'New Code'
      } as CodeNode;
      break;
    case 'draw':
      specificNode = {
        ...baseProperties,
        data: {},
        title: 'New Drawing'
      } as DrawNode;
      break;
    default:
      throw new Error('Invalid node type');
  }

  setNodes((nds) => [...nds, specificNode as BaseNode]);
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
