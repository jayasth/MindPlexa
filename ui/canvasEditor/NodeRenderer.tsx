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
  console.log('NodeRenderer: Received node', { id, type: data.type, data });

  const node = useNodeStore((state) => state.nodes.find((n) => n.id === id)) as
    | BaseNode
    | undefined;

  const updateNode = useNodeStore((state) => state.updateNode);
  const toggleEditMode = useNodeStore((state) => state.toggleEditMode);
  const canvasId = useCanvasStore((state) => state.canvasID);
  const [size, setSize] = useState(
    getNodeSpecificProperties(
      node?.type || 'note',
      node?.data?.isEditing ?? false
    )
  );
  const [isEditing, setIsEditing] = useState(node?.data?.isEditing ?? false);

  useEffect(() => {
    if (node) {
      console.log(
        `NodeRenderer: Node ID: ${id}, Type: ${node.type}, IsEditing: ${node.data?.isEditing}`
      );
      if (isEditing !== node.data?.isEditing) {
        const newSize = getNodeSpecificProperties(
          node.type,
          node.data?.isEditing
        );
        setSize(newSize);
        setIsEditing(node.data?.isEditing);
      }
    } else {
      console.log(`NodeRenderer: Node not found, ID: ${id}`);
    }
  }, [node, id, isEditing]);

  if (!node) {
    console.log(`NodeRenderer: Node not found, ID: ${id}`);
    return null;
  }

  const handleEdit = () => {
    if (node.type !== 'selection_menu') {
      toggleEditMode(id);
      const newSize = getNodeSpecificProperties(
        node.type,
        !node.data?.isEditing
      );
      updateNode(
        id,
        {
          ...newSize,
          data: {
            ...node.data,
            isEditing: !node.data?.isEditing,
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
    onDelete: () =>
      console.log(`Delete action for Node ID: ${id}, Type: ${node.type}`),
    onChangeColor: () =>
      console.log(`Change color action for Node ID: ${id}, Type: ${node.type}`),
    onResize: () =>
      console.log(`Resize action for Node ID: ${id}, Type: ${node.type}`),
    onTag: () =>
      console.log(`Tag action for Node ID: ${id}, Type: ${node.type}`),
    onAttach: () =>
      console.log(`Attach action for Node ID: ${id}, Type: ${node.type}`),
    width: size.width,
    height: size.height,
    selected: selected,
    onLabelChange: (label: string) =>
      updateNode(id, { data: { ...node.data, label } }, canvasId),
    onEdit: handleEdit,
    onNodeResizeStop:
      node.type !== 'selection_menu' ? onNodeResizeStop : undefined
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
    const componentInfo =
      nodeComponents[node.type as keyof typeof nodeComponents];
    let NodeComponent;

    if (node.type === 'selection_menu') {
      NodeComponent = componentInfo.view;
    } else if ('edit' in componentInfo && node.data?.isEditing) {
      NodeComponent = componentInfo.edit;
    } else {
      NodeComponent = componentInfo.view;
    }

    console.log(
      `NodeRenderer: Rendering node ID: ${id}, Type: ${node.type}, IsEditing: ${node.data?.isEditing}`
    );

    return (
      <NodeComponent
        {...commonProps}
        data={{
          ...node.data,
          width: size.width,
          height: size.height,
          backgroundColor: node.data.backgroundColor,
          textColor: node.data.textColor,
          id: node.id,
          isTemporary: node.data.isTemporary
        }}
        selected={selected}
      />
    );
  }

  console.log(
    `NodeRenderer: Unrecognized node type for ID: ${id}, Type: ${node.type}`
  );
  return null;
};

export default NodeRenderer;
