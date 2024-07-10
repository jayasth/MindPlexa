import React, { useMemo } from 'react';
import { NodeProps, Node } from 'reactflow';
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
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';

type NodeResizeStopHandler = (
  nodeId: string,
  newSize: { width: number; height: number },
  newPosition: { x: number; y: number }
) => void;

interface CommonNodeProps extends NodeProps {
  data: {
    id: string;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
    isEditing: boolean;
    isTemporary: boolean;
    [key: string]: any;
  };
  selected: boolean;
  width: number;
  height: number;
}

interface EditableNodeProps extends CommonNodeProps {
  onNodeResizeStop: NodeResizeStopHandler;
}

interface NodeRendererProps extends NodeProps {
  onNodeResizeStop: NodeResizeStopHandler;
}

type ViewNodeComponentType = React.ComponentType<CommonNodeProps>;
type EditNodeComponentType = React.ComponentType<EditableNodeProps>;

const NodeRenderer: React.FC<NodeRendererProps> = ({
  type,
  data,
  id,
  selected,
  onNodeResizeStop,
  ...props
}) => {
  const nodeComponents = useMemo<
    Record<string, { view: ViewNodeComponentType; edit: EditNodeComponentType }>
  >(
    () => ({
      note: {
        view: NoteNodeView as ViewNodeComponentType,
        edit: NoteNodeEdit as unknown as EditNodeComponentType
      },
      task: {
        view: TaskNodeView as ViewNodeComponentType,
        edit: TaskNodeEdit as unknown as EditNodeComponentType
      },
      table: {
        view: TableNodeView as ViewNodeComponentType,
        edit: TableNodeEdit as unknown as EditNodeComponentType
      },
      calendar: {
        view: CalendarNodeView as ViewNodeComponentType,
        edit: CalendarNodeEdit as unknown as EditNodeComponentType
      },
      draw: {
        view: DrawNodeView as ViewNodeComponentType,
        edit: DrawNodeEdit as unknown as EditNodeComponentType
      },
      selection_menu: {
        view: NodeSelectionMenu as unknown as ViewNodeComponentType,
        edit: NodeSelectionMenu as unknown as EditNodeComponentType
      }
    }),
    []
  );

  const NodeComponent = useMemo(() => {
    const components = nodeComponents[type as keyof typeof nodeComponents];
    if (!components) {
      console.error(`Unknown node type: ${type}`);
      return null;
    }
    return data.isEditing && type !== 'selection_menu'
      ? components.edit
      : components.view;
  }, [type, data.isEditing, nodeComponents]);

  if (!NodeComponent) {
    console.error(`Failed to render node of type: ${type}`);
    return null;
  }

  const nodeData = useMemo(() => {
    if (!data) {
      console.error(`No data provided for node: ${id}`);
      return {};
    }
    return data;
  }, [data, id]);

  const dimensions = useMemo(() => {
    const defaultDimensions = getNodeSpecificProperties(type, data.isEditing);
    if (type === 'selection_menu') {
      return {
        width: defaultDimensions.width,
        height: defaultDimensions.height
      };
    }
    return {
      width: data.isEditing
        ? data.width || defaultDimensions.width
        : data.width || defaultDimensions.width,
      height: data.isEditing
        ? data.height || defaultDimensions.height
        : data.height || defaultDimensions.height
    };
  }, [
    type,
    data.isEditing,
    data.editWidth,
    data.editHeight,
    data.viewWidth,
    data.viewHeight
  ]);

  const handleNodeResizeStop: NodeResizeStopHandler = (
    nodeId,
    newSize,
    newPosition
  ) => {
    if (data.isEditing && type !== 'selection_menu') {
      try {
        onNodeResizeStop(nodeId, newSize, newPosition);
      } catch (error) {
        console.error(`Error in onNodeResizeStop for node ${nodeId}:`, error);
      }
    }
  };

  return (
    <NodeComponent
      id={id}
      type={type}
      data={nodeData}
      selected={selected}
      width={dimensions.width}
      height={dimensions.height}
      onNodeResizeStop={handleNodeResizeStop}
      {...props}
    />
  );
};

export default React.memo(NodeRenderer);
