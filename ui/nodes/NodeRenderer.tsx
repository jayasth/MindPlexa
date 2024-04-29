import React from 'react';
import { NodeProps } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import NoteNode from './NoteNode';
import TaskNode from './TaskNode';
import CustomNode from './CustomNode';
import CodeNode from './CodeNode';
import DrawNode from './DrawNode';
import NodeSelectionMenu, { NodeSelectionMenuProps } from './NodeSelectionMenu';
import { useStore } from '@/app/store/useCanvasStore';

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
  const updateNode = useStore((state) => state.updateNode);

  const commonProps = {
    draggable: true,
    connectable: true,
    onDelete: () => console.log(`Delete ${node.type}`),
    onChangeColor: () => console.log('Change Color'),
    onResize: () => console.log('Resize Node'),
    onTag: () => console.log('Tag Node'),
    onAttach: () => console.log('Attach File'),
    width: node.width,
    height: node.height,
    selected: selected,
    onNodeResizeStop: onNodeResizeStop,
    onLabelChange: (label: string) =>
      updateNode(id, { data: { ...node.data, label } })
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
            width: node.width ?? 200,
            height: node.height ?? 100
          }}
        />
      );

    default:
      return null;
  }
};

export default NodeRenderer;
