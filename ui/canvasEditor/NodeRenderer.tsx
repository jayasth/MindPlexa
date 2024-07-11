import React, { useMemo, useEffect } from 'react';
import { NodeProps, Position } from 'reactflow';
import dynamic from 'next/dynamic';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import NodeSelectionMenu from '@/ui/nodes/nodeSelectionMenu/NodeSelectionMenu';

const NoteNodeView = dynamic(() => import('@/ui/nodes/noteNode/NoteNodeView'), {
  ssr: false
});
const NoteNodeEdit = dynamic(() => import('@/ui/nodes/noteNode/NoteNodeEdit'), {
  ssr: false
});
const TaskNodeView = dynamic(() => import('@/ui/nodes/taskNode/TaskNodeView'), {
  ssr: false
});
const TaskNodeEdit = dynamic(() => import('@/ui/nodes/taskNode/TaskNodeEdit'), {
  ssr: false
});
const TableNodeView = dynamic(
  () => import('@/ui/nodes/tableNode/TableNodeView'),
  { ssr: false }
);
const TableNodeEdit = dynamic(
  () => import('@/ui/nodes/tableNode/TableNodeEdit'),
  { ssr: false }
);
const CalendarNodeView = dynamic(
  () => import('@/ui/nodes/calendarNode/CalendarNodeView'),
  { ssr: false }
);
const CalendarNodeEdit = dynamic(
  () => import('@/ui/nodes/calendarNode/CalendarNodeEdit'),
  { ssr: false }
);
const DrawNodeView = dynamic(() => import('@/ui/nodes/drawNode/DrawNodeView'), {
  ssr: false
});
const DrawNodeEdit = dynamic(() => import('@/ui/nodes/drawNode/DrawNodeEdit'), {
  ssr: false
});

interface NodeRendererProps extends NodeProps {
  onNodeResizeStop?: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
  ) => void;
  selectNodesOnDrag?: boolean;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
  type,
  data,
  isConnectable,
  selected,
  id,
  dragging,
  zIndex,
  xPos,
  yPos,
  selectNodesOnDrag,
  onNodeResizeStop,
  ...props
}) => {
  const node = useNodeStore((state) => state.nodes.find((n) => n.id === id));
  const updateNode = useNodeStore((state) => state.updateNode);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const canvasId = useCanvasStore((state) => state.canvasId);

  useEffect(() => {
    if (!node) {
      console.error(`Node not found, ID: ${id}`);
    }
  }, [node, id]);

  const nodeContent = useMemo(() => {
    if (!node) return null;

    const commonProps = {
      id,
      type,
      data: {
        ...data,
        isEditing: node.data.isEditing,
        tags: node.data.tags || [],
        attachedFiles: node.data.attachedFiles || []
      },
      isConnectable,
      selected,
      dragging,
      zIndex,
      xPos,
      yPos,
      selectNodesOnDrag,
      ...props
    };

    const position = { x: xPos, y: yPos };
    const dimensions = getNodeSpecificProperties(type, node.data.isEditing);

    if (type === 'selection_menu') {
      return (
        <NodeSelectionMenu
          {...commonProps}
          position={position}
          parentNode={data.parentNode}
          width={dimensions.width}
          height={dimensions.height}
        />
      );
    }

    const nodeComponents = {
      note: { view: NoteNodeView, edit: NoteNodeEdit },
      task: { view: TaskNodeView, edit: TaskNodeEdit },
      table: { view: TableNodeView, edit: TableNodeEdit },
      calendar: { view: CalendarNodeView, edit: CalendarNodeEdit },
      draw: { view: DrawNodeView, edit: DrawNodeEdit }
    };

    const NodeComponent = node.data.isEditing
      ? nodeComponents[type]?.edit
      : nodeComponents[type]?.view;

    if (!NodeComponent) {
      console.error('Unknown node type:', type);
      return null;
    }

    const handleEdit = () => {
      toggleEditMode(id);
      updateNode(
        id,
        { data: { ...node.data, isEditing: !node.data.isEditing } },
        canvasId
      );
    };

    return (
      <NodeComponent
        {...commonProps}
        {...dimensions}
        position={position}
        onNodeResizeStop={onNodeResizeStop || (() => {})}
        onEdit={handleEdit}
      />
    );
  }, [
    node,
    id,
    type,
    data,
    isConnectable,
    selected,
    dragging,
    zIndex,
    xPos,
    yPos,
    selectNodesOnDrag,
    onNodeResizeStop,
    props,
    toggleEditMode,
    updateNode,
    canvasId
  ]);

  return nodeContent;
};

export default React.memo(NodeRenderer);
