import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import dynamic from 'next/dynamic';
import { useStore } from '@/app/store/useCanvasStore';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';

const NoteNodeEdit = dynamic(() => import('@/ui/nodes/noteNode/NoteNodeEdit'), {
  ssr: false
});
const TaskNodeEdit = dynamic(() => import('@/ui/nodes/taskNode/TaskNodeEdit'), {
  ssr: false
});
const TableNodeEdit = dynamic(
  () => import('@/ui/nodes/tableNode/TableNodeEdit'),
  {
    ssr: false
  }
);
const CalendarNodeEdit = dynamic(
  () => import('@/ui/nodes/calendarNode/CalendarNodeEdit'),
  {
    ssr: false
  }
);
const DrawNodeEdit = dynamic(() => import('@/ui/nodes/drawNode/DrawNodeEdit'), {
  ssr: false
});

const NoteNodeView = dynamic(() => import('@/ui/nodes/noteNode/NoteNodeView'), {
  ssr: false
});
const TaskNodeView = dynamic(() => import('@/ui/nodes/taskNode/TaskNodeView'), {
  ssr: false
});
const TableNodeView = dynamic(
  () => import('@/ui/nodes/tableNode/TableNodeView'),
  {
    ssr: false
  }
);
const CalendarNodeView = dynamic(
  () => import('@/ui/nodes/calendarNode/CalendarNodeView'),
  {
    ssr: false
  }
);
const DrawNodeView = dynamic(() => import('@/ui/nodes/drawNode/DrawNodeView'), {
  ssr: false
});

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
  const node = useStore((state) => state.nodes.find((n) => n.id === id)) as
    | BaseNode
    | undefined; // node might be undefined if it has been deleted

  const updateNode = useStore((state) => state.updateNode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const [size, setSize] = useState(
    getNodeSpecificProperties(node?.type, node?.isEditing ?? false)
  );

  useEffect(() => {
    if (node && node.type !== 'selectionMenu') {
      console.log(
        `NodeRenderer: Node ${id} type ${node.type}: width = ${node.width}, height = ${node.height}`
      );
    }
  }, [node?.width, node?.height, node?.type, id]);

  useEffect(() => {
    if (node) {
      const newSize = getNodeSpecificProperties(node.type, node.isEditing);
      setSize(newSize);
      updateNode(id, newSize);
      console.log(
        `NodeRenderer: Updated size for node ${id}: width = ${newSize.width}, height = ${newSize.height}`
      );
    }
  }, [node?.isEditing, node?.type, updateNode, id]);

  // Early return if node does not exist
  if (!node) {
    console.log(
      `NodeRenderer: Node with ID ${id} not found, possibly deleted.`
    );
    return null;
  }

  const handleEdit = () => {
    if (node.type !== 'selectionMenu') {
      toggleEditMode(id);
      const newSize = getNodeSpecificProperties(node.type, !node.isEditing);
      updateNode(id, {
        ...newSize,
        data: {
          ...node.data,
          tags: node.data.tags || [],
          attachedFiles: node.data.attachedFiles || []
        }
      });
      onNodeResizeStop(id, newSize, node.position);
    }
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
    onEdit: handleEdit,
    onNodeResizeStop
  };

  const nodeComponents = {
    note: { view: NoteNodeView, edit: NoteNodeEdit },
    task: { view: TaskNodeView, edit: TaskNodeEdit },
    table: { view: TableNodeView, edit: TableNodeEdit },
    calendar: { view: CalendarNodeView, edit: CalendarNodeEdit },
    draw: { view: DrawNodeView, edit: DrawNodeEdit }
  };

  if (node.type in nodeComponents) {
    const { view, edit } = nodeComponents[node.type];
    const NodeComponent = node.isEditing ? edit : view;

    console.log(
      `NodeRenderer: Rendering ${node.type} with background color: ${node.data.backgroundColor}, text color: ${node.data.textColor}`
    );

    return (
      <NodeComponent
        {...commonProps}
        onEdit={handleEdit}
        data={{
          ...node,
          ...node.data,
          width: size.width,
          height: size.height,
          backgroundColor: node.data.backgroundColor,
          textColor: node.data.textColor
        }}
        selected={selected}
        onNodeResizeStop={onNodeResizeStop}
        {...(node.isEditing && { selected: selected })}
      />
    );
  }

  return null;
};

export default NodeRenderer;
