import React, { useMemo } from 'react';
import { NodeProps, Position } from 'reactflow';
import NoteNodeView from '@/ui/nodes/noteNode/NoteNodeView';
import NoteNodeEdit from '@/ui/nodes/noteNode/NoteNodeEdit';
import TaskNodeView from '@/ui/nodes/taskNode/TaskNodeView';
import TaskNodeEdit from '@/ui/nodes/taskNode/TaskNodeEdit';
import TableNodeView from '@/ui/nodes/tableNode/TableNodeView';
import TableNodeEdit from '@/ui/nodes/tableNode/TableNodeEdit';
import CalendarNodeView from '@/ui/nodes/calendarNode/CalendarNodeView';
import CalendarNodeEdit from '@/ui/nodes/calendarNode/CalendarNodeEdit';
import DrawNodeView from '@/ui/nodes/drawNode/DrawNodeView';
import DrawNodeEdit from '@/ui/nodes/drawNode/DrawNodeEdit';
import NodeSelectionMenu from '@/ui/nodes/nodeSelectionMenu/NodeSelectionMenu';

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
  const nodeContent = useMemo(() => {
    const commonProps = {
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
      ...props
    };

    const position = { x: xPos, y: yPos };
    const dimensions = {
      width: data.isEditing ? data.editWidth : data.viewWidth,
      height: data.isEditing ? data.editHeight : data.viewHeight
    };

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

    const NodeComponent = data.isEditing
      ? {
          note: NoteNodeEdit,
          task: TaskNodeEdit,
          table: TableNodeEdit,
          calendar: CalendarNodeEdit,
          draw: DrawNodeEdit
        }[type]
      : {
          note: NoteNodeView,
          task: TaskNodeView,
          table: TableNodeView,
          calendar: CalendarNodeView,
          draw: DrawNodeView
        }[type];

    if (!NodeComponent) {
      console.error('Unknown node type:', type);
      return null;
    }

    return (
      <NodeComponent
        {...commonProps}
        {...dimensions}
        position={position}
        onNodeResizeStop={onNodeResizeStop || (() => {})}
      />
    );
  }, [
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
    props
  ]);

  return nodeContent;
};

export default React.memo(NodeRenderer);
