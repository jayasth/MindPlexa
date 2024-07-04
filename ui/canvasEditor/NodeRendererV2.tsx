import React, { useState, useEffect, useMemo } from 'react';
import { NodeProps } from 'reactflow';
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
    | undefined;

  const updateNode = useStore((state) => state.updateNode);
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const [size, setSize] = useState(
    getNodeSpecificProperties(node?.type || 'note', node?.isEditing ?? false)
  );

  useEffect(() => {
    if (node) {
      const newSize = getNodeSpecificProperties(node.type, node.isEditing);
      setSize(newSize);
      updateNode(id, newSize);
    }
  }, [node?.isEditing, node?.type, updateNode, id]);

  const handleEdit = () => {
    if (node && node.type !== 'selection_menu') {
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

  const commonProps = useMemo(
    () => ({
      draggable: true,
      connectable: true,
      onDelete: () => console.log(`Delete ${node?.type}`),
      onChangeColor: () => console.log('Change Color'),
      onResize: () => console.log('Resize Node'),
      onTag: () => console.log('Tag Node'),
      onAttach: () => console.log('Attach File'),
      width: size.width,
      height: size.height,
      selected: selected,
      onLabelChange: (label: string) =>
        updateNode(id, { data: { ...node?.data, label } }),
      onEdit: handleEdit,
      onNodeResizeStop
    }),
    [node, size, selected, id, updateNode, handleEdit, onNodeResizeStop]
  );

  const nodeComponents = useMemo(
    () => ({
      note: { view: NoteNodeView, edit: NoteNodeEdit },
      task: { view: TaskNodeView, edit: TaskNodeEdit },
      table: { view: TableNodeView, edit: TableNodeEdit },
      calendar: { view: CalendarNodeView, edit: CalendarNodeEdit },
      draw: { view: DrawNodeView, edit: DrawNodeEdit }
    }),
    []
  );

  if (!node) {
    return null;
  }

  if (node.type in nodeComponents) {
    const { view, edit } = nodeComponents[node.type];
    const NodeComponent = node.isEditing ? edit : view;

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

export default React.memo(NodeRenderer);
