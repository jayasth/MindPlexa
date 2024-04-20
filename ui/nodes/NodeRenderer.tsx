// ui/nodes/NodeRenderer.tsx
import React from 'react';
import { Dispatch } from 'react';
import NoteNode from './NoteNode';
import TaskNode from './TaskNode';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import DrawNode from './DrawNode';
import {
  Node,
  CanvasEditorAction
} from '@/ui/canvasEditor/canvasEditorReducer';

interface NodeRendererProps {
  node: Node;
  dispatch: Dispatch<CanvasEditorAction>;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({ node, dispatch }) => {
  const handleDeleteNode = (id: string) =>
    dispatch({ type: 'DELETE_NODE', payload: id });
  const handleChangeNodeColor = (id: string, color: string) =>
    dispatch({ type: 'CHANGE_NODE_COLOR', payload: { id, color } });
  const handleResizeNode = (id: string, width: number, height: number) =>
    dispatch({ type: 'RESIZE_NODE', payload: { id, width, height } });

  switch (node.type) {
    case 'note':
      return (
        <NoteNode
          node={node}
          onDelete={() => handleDeleteNode(node.id)}
          onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
          onResize={(width, height) => handleResizeNode(node.id, width, height)}
        />
      );
    case 'task':
      return (
        <TaskNode
          node={node}
          onDelete={() => handleDeleteNode(node.id)}
          onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
          onToggleComplete={() =>
            dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: node.id })
          }
          onResize={(width, height) => handleResizeNode(node.id, width, height)}
          task={node.task}
          completed={node.completed}
          color={node.color}
          width={node.width}
          height={node.height}
        />
      );

    case 'custom':
      return (
        <CustomNode
          node={node}
          onDelete={() => handleDeleteNode(node.id)}
          onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
          onResize={(width, height) => handleResizeNode(node.id, width, height)}
        />
      );
    case 'code':
      return (
        <CodeNode
          node={node}
          onDelete={() => handleDeleteNode(node.id)}
          onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
          onResize={(width, height) => handleResizeNode(node.id, width, height)}
        />
      );
    case 'draw':
      return (
        <DrawNode
          node={node}
          onDelete={() => handleDeleteNode(node.id)}
          onChangeColor={(color) => handleChangeNodeColor(node.id, color)}
          onResize={(width, height) => handleResizeNode(node.id, width, height)}
        />
      );
    default:
      return null;
  }
};

export default NodeRenderer;
