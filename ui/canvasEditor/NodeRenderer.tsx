import React, { useState, useEffect } from 'react';
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

const NodeRenderer: React.FC<NodeRendererProps> = React.memo(
  ({ data, selected, id, onNodeResizeStop }) => {
    const node = useStore((state) => state.nodes.find((n) => n.id === id)) as
      | BaseNode
      | undefined;

    const toggleEditMode = useStore((state) => state.toggleEditMode);
    const updateNode = useStore((state) => state.updateNode);
    const [size, setSize] = useState(() =>
      getNodeSpecificProperties(node?.type || 'note', node?.isEditing ?? false)
    );

    useEffect(() => {
      if (node && node.type !== 'selectionMenu') {
        const newSize = getNodeSpecificProperties(node.type, node.isEditing);
        if (newSize.width !== size.width || newSize.height !== size.height) {
          setSize(newSize);
          onNodeResizeStop(id, newSize, node.position);
        }
      }
    }, [
      node?.isEditing,
      node?.type,
      id,
      size.width,
      size.height,
      onNodeResizeStop
    ]);

    if (!node || !node.position) {
      console.log(
        `NodeRenderer: Node with ID ${id} not found or has invalid position.`
      );
      return null;
    }

    const handleEdit = () => {
      if (node.type !== 'selectionMenu') {
        toggleEditMode(id);
        const newSize = getNodeSpecificProperties(node.type, !node.isEditing);
        setSize(newSize);
        onNodeResizeStop(id, newSize, node.position);
      }
    };

    const commonProps = {
      draggable: node.draggable ?? true,
      connectable: node.connectable ?? true,
      onDelete: () => console.log(`Delete ${node.type}`),
      onChangeColor: () => console.log('Change Color'),
      onResize: () => console.log('Resize Node'),
      onTag: () => console.log('Tag Node'),
      onAttach: () => console.log('Attach File'),
      width: size.width,
      height: size.height,
      selected: selected,
      onLabelChange: (label: string) => {
        // Handle label change without updateNode
        console.log(`Label changed to: ${label}`);
      },
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

      console.log('NodeRenderer: Node data:', {
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position,
        isEditing: node.isEditing,
        size: size
      });

      return (
        <NodeComponent
          {...commonProps}
          onEdit={handleEdit}
          data={{
            ...node,
            ...node.data,
            width: size.width,
            height: size.height,
            backgroundColor: node.data.background_color,
            textColor: node.data.text_color,
            editWidth: node.data.edit_width,
            editHeight: node.data.edit_height,
            viewWidth: node.data.view_width,
            viewHeight: node.data.view_height,
            position: node.position,
            isEditing: node.isEditing,
            parentNodeId: node.data.parent_node_id,
            zIndex: node.data.z_index,
            tags: node.data.tags,
            attachedFiles: node.data.attached_files
          }}
          selected={selected}
          onNodeResizeStop={onNodeResizeStop}
          {...(node.isEditing && { selected: selected })}
        />
      );
    }

    return null;
  }
);

export default NodeRenderer;
