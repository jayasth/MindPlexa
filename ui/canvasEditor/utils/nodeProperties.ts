import type {
  NoteNode,
  TaskNode,
  CustomNode,
  CodeNode,
  DrawNode
} from '@/ui/canvasEditor/nodeTypes';

// Define default dimensions for nodes
export const defaultNodeDimensions = {
  width: 200,
  height: 300
};

export const getNodeSpecificProperties = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
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
    default:
      throw new Error('Invalid node type');
  }
};
