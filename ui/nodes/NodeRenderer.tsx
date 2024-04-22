import React from 'react';
import { NodeProps } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';
import NoteNode from './NoteNode';
import TaskNode from './TaskNode';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import DrawNode from './DrawNode';

const NodeRenderer: React.FC<NodeProps> = ({ data, selected, id }) => {
  const node = data as BaseNode;

  // Determine the type of node and render the appropriate component
  switch (node.type) {
    case 'note':
      return (
        <NoteNode
          data={node}
          onDelete={() => {}}
          onChangeColor={() => {}}
          onResize={() => {}}
          id={id}
          selected={selected}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    case 'task':
      return (
        <TaskNode
          data={node}
          onDelete={() => {}}
          onChangeColor={() => {}}
          onResize={() => {}}
          id={id}
          selected={selected}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
          onToggleComplete={() => {}}
        />
      );
    case 'custom':
      return (
        <CustomNode
          data={node}
          onDelete={() => {}}
          onChangeColor={() => {}}
          onResize={() => {}}
          id={id}
          selected={selected}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    case 'code':
      return (
        <CodeNode
          data={node}
          onDelete={() => {}}
          onChangeColor={() => {}}
          onResize={() => {}}
          id={id}
          selected={selected}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    case 'draw':
      return (
        <DrawNode
          data={node}
          onDelete={() => {}}
          onChangeColor={() => {}}
          onResize={() => {}}
          id={id}
          selected={selected}
          type={node.type}
          zIndex={0}
          isConnectable={true}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      );
    default:
      return null; // Return null if the node type is unrecognized
  }
};

export default NodeRenderer;
