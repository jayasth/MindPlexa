import type {
  NoteNode,
  TaskNode,
  CustomNode,
  CodeNode,
  DrawNode
} from '@/ui/canvasEditor/nodeTypes';

// Define default dimensions for nodes
export const nodeDimensions = {
  note: { width: 100, height: 150 },
  task: { width: 120, height: 160 },
  custom: { width: 130, height: 170 },
  code: { width: 140, height: 180 },
  draw: { width: 150, height: 190 },
  selectionMenu: { width: 150, height: 50 }
};

export const getNodeSpecificProperties = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu'
) => {
  switch (nodeType) {
    case 'note':
      return {
        content: ''
      } as Partial<NoteNode>;
    case 'task':
      return {
        completed: false,
        task: 'New Task'
      } as Partial<TaskNode>;
    case 'custom':
      return {
        data: {}
      } as Partial<CustomNode>;
    case 'code':
      return {
        code: '',
        language: 'plaintext'
      } as Partial<CodeNode>;
    case 'draw':
      return {
        data: {}
      } as Partial<DrawNode>;
    case 'selectionMenu':
      return {};
    default:
      throw new Error('Invalid node type');
  }
};
