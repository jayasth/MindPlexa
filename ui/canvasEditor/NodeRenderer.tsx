import React, { useState, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import dynamic from 'next/dynamic';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import NodeSelectionMenu from '@/ui/nodes/nodeSelectionMenu/NodeSelectionMenu';

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
  const node = useNodeStore((state) => state.nodes.find((n) => n.id === id)) as
    | BaseNode
    | undefined;

  const updateNode = useNodeStore((state) => state.updateNode);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const canvasId = useCanvasStore((state) => state.canvasID);
  const [size, setSize] = useState(
    getNodeSpecificProperties(node?.type || 'note', node?.isEditing ?? false)
  );
  const [isEditing, setIsEditing] = useState(node?.isEditing ?? false);

  useEffect(() => {
    if (node && isEditing !== node.isEditing) {
      const newSize = getNodeSpecificProperties(node.type, node.isEditing);
      setSize(newSize);
      setIsEditing(node.isEditing);
      console.log(`NodeRenderer: Node ID: ${id}`);
    }
  }, [node?.isEditing, node?.type, id, isEditing, node]);

  if (!node) {
    console.log(`NodeRenderer: Node ID: ${id}`);
    return null;
  }

  const handleEdit = () => {
    if (node.type !== 'selection_menu') {
      toggleEditMode(id);
      const newSize = getNodeSpecificProperties(node.type, !node.isEditing);
      updateNode(
        id,
        {
          ...newSize,
          data: {
            ...node.data,
            tags: node.data.tags || [],
            attachedFiles: node.data.attachedFiles || []
          }
        },
        canvasId
      );
      onNodeResizeStop(id, newSize, node.position);
    }
  };

  const commonProps = {
    draggable: true,
    connectable: true,
    onDelete: () => console.log(`Node ID: ${id}`),
    onChangeColor: () => console.log(`Node ID: ${id}`),
    onResize: () => console.log(`Node ID: ${id}`),
    onTag: () => console.log(`Node ID: ${id}`),
    onAttach: () => console.log(`Node ID: ${id}`),
    width: size.width,
    height: size.height,
    selected: selected,
    onLabelChange: (label: string) =>
      updateNode(id, { data: { ...node.data, label } }, canvasId),
    onEdit: handleEdit,
    onNodeResizeStop
  };

  const nodeComponents = {
    note: { view: NoteNodeView, edit: NoteNodeEdit },
    task: { view: TaskNodeView, edit: TaskNodeEdit },
    table: { view: TableNodeView, edit: TableNodeEdit },
    calendar: { view: CalendarNodeView, edit: CalendarNodeEdit },
    draw: { view: DrawNodeView, edit: DrawNodeEdit },
    selection_menu: { view: NodeSelectionMenu }
  };

  if (node.type in nodeComponents) {
    const componentInfo = nodeComponents[node.type];
    let NodeComponent;

    if ('edit' in componentInfo && node.isEditing) {
      NodeComponent = componentInfo.edit;
    } else {
      NodeComponent = componentInfo.view;
    }

    console.log(`NodeRenderer: Node ID: ${id}`);

    return (
      <NodeComponent
        {...commonProps}
        data={{
          ...node,
          ...node.data,
          width: size.width,
          height: size.height,
          backgroundColor: node.data.backgroundColor,
          textColor: node.data.textColor,
          id: node.id
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
