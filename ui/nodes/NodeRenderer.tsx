import React from 'react';
import { NodeProps } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';
import NoteNode from './NoteNode';
import TaskNode from './TaskNode';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import DrawNode from './DrawNode';
import NodeSelectionMenu, { NodeSelectionMenuProps } from './NodeSelectionMenu';
import styles from '@/ui/edges/EdgeStyles.module.css'; // Importing styles

interface NodeRendererProps extends NodeProps {
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number }
  ) => void;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
  data,
  selected,
  id,
  onNodeResizeStop
}) => {
  const node = data as BaseNode;

  const commonProps = {
    onDelete: () => console.log(`Delete ${node.type}`),
    onChangeColor: () => console.log('Change Color'),
    onResize: () => console.log('Resize Node'),
    onTag: () => console.log('Tag Node'),
    onAttach: () => console.log('Attach File'),
    width: node.width,
    height: node.height,
    selected: selected,
    onNodeResizeStop: (newSize: { width: number; height: number }) => {
      console.log('Resizing Node:', id, newSize);
      onNodeResizeStop(id, newSize);
    },
    id: id,
    type: node.type,
    zIndex: 0,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    className: styles.reactFlowNode // Applying styles to nodes
  };

  switch (node.type) {
    case 'selectionMenu':
      const extendedNode = node as unknown as NodeSelectionMenuProps;
      return <NodeSelectionMenu {...commonProps} data={extendedNode.data} />;
    case 'note':
    case 'task':
    case 'custom':
    case 'code':
    case 'draw':
      const NodeComponent = {
        note: NoteNode,
        task: TaskNode,
        custom: CustomNode,
        code: CodeNode,
        draw: DrawNode
      }[node.type];

      return (
        <NodeComponent
          {...commonProps}
          data={{
            ...node,
            width: node.width ?? 200, // Default width if not specified
            height: node.height ?? 100 // Default height if not specified
          }}
        />
      );

    default:
      return null;
  }
};

export default NodeRenderer;
