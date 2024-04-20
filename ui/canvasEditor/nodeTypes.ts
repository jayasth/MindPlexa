import { NodeProps } from 'reactflow';
import NoteComponent from '@/ui/nodes/NoteNode';
import TaskComponent from '@/ui/nodes/TaskNode';
import CustomComponent from '@/ui/nodes/CustomNode';
import CodeComponent from '@/ui/nodes/CodeNode';
import DrawComponent from '@/ui/nodes/DrawNode';

import CustomEdge from '@/ui/canvasEditor/CustomEdge';

// Explicitly assert the type of node components to be React.FC<NodeProps>
export const nodeTypes = {
  note: NoteComponent as React.FC<NodeProps>,
  task: TaskComponent as React.FC<NodeProps>,
  custom: CustomComponent as React.FC<NodeProps>,
  code: CodeComponent as React.FC<NodeProps>,
  draw: DrawComponent as React.FC<NodeProps>
};

// Export edgeTypes with your edge component
export const edgeTypes = {
  customEdge: CustomEdge
};
