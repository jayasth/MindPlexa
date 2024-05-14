import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
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
import { useStore } from '@/app/store/useCanvasStore';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';

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

  const [size, setSize] = useState(
    getNodeSpecificProperties(node.type, node.isEditing)
  );

  useEffect(() => {
    if (node && node.type !== 'selectionMenu') {
      console.log(
        `NodeRenderer: Node ${id} type ${node.type}: width = ${node.width}, height = ${node.height}`
      );
    }
  }, [node?.width, node?.height, node?.type, id]);

  useEffect(() => {
    const newSize = getNodeSpecificProperties(node.type, node.isEditing);
    setSize(newSize);
    updateNode(id, newSize);
    console.log(
      `NodeRenderer: Updated size for node ${id}: width = ${newSize.width}, height = ${newSize.height}`
    );
  }, [node.isEditing, node.type, updateNode, id]);

  const handleEdit = () => {
    if (node.type !== 'selectionMenu') {
      toggleEditMode(id);
      const newSize = getNodeSpecificProperties(node.type, !node.isEditing);
      updateNode(id, newSize);
      onNodeResizeStop(id, newSize, node.position);
      console.log(
        `NodeRenderer: Edit toggle for node ${id}: new size = width: ${newSize.width}, height = ${newSize.height}`
      );
    }
  };

  const handleDragStart = (event) => {
    if (event.target.closest('.resize-handle')) {
      event.preventDefault();
      return;
    }
  };

  const commonProps = {
    draggable: true,
    onDragStart: handleDragStart,
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
    onEdit: handleEdit,
    onNodeResizeStop
  };

  const nodeComponents = {
    note: { view: NoteNode, edit: NoteNodeEdit },
    task: { view: TaskNode, edit: TaskNodeEdit },
    custom: { view: CustomNode, edit: CustomNodeEdit },
    code: { view: CodeNode, edit: CodeNodeEdit },
    draw: { view: DrawNode, edit: DrawNodeEdit }
  };

  if (node.type in nodeComponents) {
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
        selected={selected}
        onNodeResizeStop={onNodeResizeStop}
      />
    );
  }

  return null;
};

export default NodeRenderer;
