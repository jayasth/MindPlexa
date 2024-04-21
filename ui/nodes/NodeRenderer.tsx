import React from 'react';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';
import NoteNode from './NoteNode';
import TaskNode from './TaskNode';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import DrawNode from './DrawNode';

// Assuming these are the correct interfaces for each node type
import {
  NoteNode as NoteNodeType,
  TaskNode as TaskNodeType,
  CustomNode as CustomNodeType,
  CodeNode as CodeNodeType,
  DrawNode as DrawNodeType
} from '@/ui/canvasEditor/canvasEditorReducer';

interface NodeRendererProps {
  node: BaseNode;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  onDelete,
  onChangeColor,
  onResize
}) => {
  // Determine the type of node and render the appropriate component
  switch (node.type) {
    case 'note':
      return (
        <NoteNode
          node={node as NoteNodeType}
          onDelete={onDelete}
          onChangeColor={onChangeColor}
          onResize={onResize}
        />
      );
    case 'task':
      return (
        <TaskNode
          node={node as TaskNodeType}
          onDelete={onDelete}
          onChangeColor={onChangeColor}
          onResize={onResize}
          onToggleComplete={() => {}}
        />
      );
    case 'custom':
      return (
        <CustomNode
          node={node as CustomNodeType}
          onDelete={onDelete}
          onChangeColor={onChangeColor}
          onResize={onResize}
        />
      );
    case 'code':
      return (
        <CodeNode
          node={node as CodeNodeType}
          onDelete={onDelete}
          onChangeColor={onChangeColor}
          onResize={onResize}
        />
      );
    case 'draw':
      return (
        <DrawNode
          node={node as DrawNodeType}
          onDelete={onDelete}
          onChangeColor={onChangeColor}
          onResize={onResize}
        />
      );
    default:
      return null; // Return null if the node type is unrecognized
  }
};

export default NodeRenderer;
