import React, { useState, useEffect, useCallback } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import NoteNode from '@/ui/nodes/noteNode/NoteNodeView';
import NoteNodeEdit from '@/ui/nodes/noteNode/NoteNodeEdit';
import TaskNode from '@/ui/nodes/taskNode/TaskNodeView';
import TaskNodeEdit from '@/ui/nodes/taskNode/TaskNodeEdit';
import CustomNode from '@/ui/nodes/customNode/CustomNodeView';
import CustomNodeEdit from '@/ui/nodes/customNode/CustomNodeEdit';
import CodeNode from '@/ui/nodes/codeNode/CodeNodeView';
import CodeNodeEdit from '@/ui/nodes/codeNode/CodeNodeEdit';
import DrawNode from '@/ui/nodes/drawNode/DrawNodeView';
import DrawNodeEdit from '@/ui/nodes/drawNode/DrawNodeEdit';
import NodeSelectionMenu from '@/ui/nodes/nodeSelectionMenu/NodeSelectionMenu';
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
  const node = useStore((state) =>
    state.nodes.find((n) => n.id === id)
  ) as BaseNode;
  const updateNode = useStore((state) => state.updateNode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);

  const [size, setSize] = useState({
    width: node.width || nodeDimensions[node.type].width,
    height: node.height || nodeDimensions[node.type].height
  });

  useEffect(() => {
    setSize({
      width: node.isEditing
        ? nodeDimensions[node.type].editWidth
        : nodeDimensions[node.type].width,
      height: node.isEditing
        ? nodeDimensions[node.type].editHeight
        : nodeDimensions[node.type].height
    });
    console.log('Node size:', {
      width: node.isEditing
        ? nodeDimensions[node.type].editWidth
        : nodeDimensions[node.type].width,
      height: node.isEditing
        ? nodeDimensions[node.type].editHeight
        : nodeDimensions[node.type].height
    });
    console.log('Node object:', node);
  }, [node.isEditing, node.type]);

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

  const handleEdit = () => {
    toggleEditMode(id);
    const newWidth = node.isEditing
      ? nodeDimensions[node.type].width
      : nodeDimensions[node.type].editWidth;
    const newHeight = node.isEditing
      ? nodeDimensions[node.type].height
      : nodeDimensions[node.type].editHeight;
    updateNode(id, {
      width: newWidth,
      height: newHeight
    });
    onNodeResizeStop(id, { width: newWidth, height: newHeight }, node.position);
  };

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
      updateNode(id, { data: { ...node.data, label } }),
    onEdit: handleEdit
  };

  const nodeComponents = {
    note: { view: NoteNode, edit: NoteNodeEdit },
    task: { view: TaskNode, edit: TaskNodeEdit },
    custom: { view: CustomNode, edit: CustomNodeEdit },
    code: { view: CodeNode, edit: CodeNodeEdit },
    draw: { view: DrawNode, edit: DrawNodeEdit }
  };

  if (node.type === 'selectionMenu') {
    return <NodeSelectionMenu {...commonProps} data={node.data} />;
  } else if (node.type in nodeComponents) {
    const { view, edit } = nodeComponents[node.type];
    const NodeComponent = node.isEditing ? edit : view;

    return (
      <NodeComponent
        {...commonProps}
        onEdit={handleEdit}
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
  }

  return null;
};

export default NodeRenderer;
