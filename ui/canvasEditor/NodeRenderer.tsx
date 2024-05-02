import React, { useState, useEffect, useCallback } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import NoteNode from '@/ui/nodes/noteNode/NoteNode';
import TaskNode from '@/ui/nodes/taskNode/TaskNode';
import CustomNode from '@/ui/nodes/customNode/CustomNode';
import CodeNode from '@/ui/nodes/codeNode/CodeNode';
import DrawNode from '@/ui/nodes/drawNode/DrawNode';
import NodeSelectionMenu, { NodeSelectionMenuProps } from './NodeSelectionMenu';
import { useStore } from '@/app/store/useCanvasStore';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

interface NodeRendererProps extends NodeProps {
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
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

  const [size, setSize] = useState({
    width: node.width || nodeDimensions[node.type].width,
    height: node.height || nodeDimensions[node.type].height
  });

  useEffect(() => {
    if (node.width && node.height) {
      setSize({ width: node.width, height: node.height });
    }
  }, [node.width, node.height]);

  const handleResizeStop = useCallback(
    (event, newSize) => {
      const newPosition = {
        x: newSize.x,
        y: newSize.y
      };
      setSize(newSize);
      onNodeResizeStop(id, newSize, newPosition);
    },
    [id, onNodeResizeStop]
  );

  const commonProps = {
    draggable: true,
    connectable: true,
    onDelete: () => console.log(`Delete ${node.type}`),
    onChangeColor: () => console.log('Change Color'),
    onResize: () => console.log('Resize Node'),
    onTag: () => console.log('Tag Node'),
    onAttach: () => console.log('Attach File'),
    width: size.width,
    height: size.height,
    selected: selected,
    onLabelChange: (label: string) =>
      updateNode(id, { data: { ...node.data, label } })
  };

  switch (node.type) {
    case 'selectionMenu':
      return <NodeSelectionMenu {...commonProps} data={node.data} />;
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
            width: size.width,
            height: size.height
          }}
        >
          <NodeResizer
            minWidth={100}
            minHeight={100}
            isVisible={selected}
            onResize={handleResizeStop}
            handleStyle={{ fill: '#ff0071' }}
          />
          <Handle
            type="target"
            position={Position.Top}
            style={{ background: '#555' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: '#555' }}
          />
        </NodeComponent>
      );

    default:
      return null;
  }
};

export default NodeRenderer;
