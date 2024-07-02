import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { NodeProps } from 'reactflow';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import dynamic from 'next/dynamic';
import { useStore } from '@/app/store/useCanvasStore';

const NoteNodeEdit = dynamic(() => import('@/ui/nodes/noteNode/NoteNodeEdit'), {
  ssr: false
});
const TaskNodeEdit = dynamic(() => import('@/ui/nodes/taskNode/TaskNodeEdit'), {
  ssr: false
});
const TableNodeEdit = dynamic(
  () => import('@/ui/nodes/tableNode/TableNodeEdit'),
  { ssr: false }
);
const CalendarNodeEdit = dynamic(
  () => import('@/ui/nodes/calendarNode/CalendarNodeEdit'),
  { ssr: false }
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
  { ssr: false }
);
const CalendarNodeView = dynamic(
  () => import('@/ui/nodes/calendarNode/CalendarNodeView'),
  { ssr: false }
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
    const node = useStore(
      useCallback((state) => state.nodes.find((n) => n.id === id), [id])
    ) as BaseNode | undefined;
    console.log('NodeRenderer: Node details:', node);
    const toggleEditMode = useStore((state) => state.toggleEditMode);

    const [size, setSize] = useState(() => ({
      width: node?.isEditing ? node?.data.edit_width : node?.data.view_width,
      height: node?.isEditing ? node?.data.edit_height : node?.data.view_height,
      x: node?.position.x,
      y: node?.position.y
    }));

    const isInitialRender = useRef(true);

    useEffect(() => {
      if (node && node.type !== 'selectionMenu') {
        const newSize = {
          width: node.isEditing ? node.data.edit_width : node.data.view_width,
          height: node.isEditing ? node.data.edit_height : node.data.view_height
        };
        if (
          newSize.width !== size.width ||
          newSize.height !== size.height ||
          node.position.x !== size.x ||
          node.position.y !== size.y
        ) {
          console.log(
            'NodeRenderer: Size or position change detected:',
            newSize,
            node.position
          );
          setSize({ ...newSize, x: node.position.x, y: node.position.y });
          if (!isInitialRender.current) {
            onNodeResizeStop(id, newSize, node.position);
          }
        }
      }
      isInitialRender.current = false;
    }, [node, id, size, onNodeResizeStop]);

    const handleEdit = useCallback(() => {
      if (node && node.type !== 'selectionMenu' && !isInitialRender.current) {
        toggleEditMode(id);
        const newSize = {
          width: !node.isEditing ? node.data.edit_width : node.data.view_width,
          height: !node.isEditing
            ? node.data.edit_height
            : node.data.view_height
        };
        setSize({ ...newSize, x: node.position.x, y: node.position.y });
        onNodeResizeStop(id, newSize, node.position);
      }
    }, [node, id, toggleEditMode, onNodeResizeStop]);

    const commonProps = useMemo(
      () => ({
        draggable: node?.draggable ?? true,
        connectable: node?.connectable ?? true,
        onDelete: () => console.log(`Delete ${node?.type}`),
        onChangeColor: () => console.log('Change Color'),
        onResize: () => console.log('Resize Node'),
        onTag: () => console.log('Tag Node'),
        onAttach: () => console.log('Attach File'),
        width: size.width,
        height: size.height,
        selected: selected,
        onLabelChange: (label: string) => {
          console.log(`Label changed to: ${label}`);
        },
        onEdit: handleEdit,
        onNodeResizeStop
      }),
      [node, size, selected, handleEdit, onNodeResizeStop]
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

    const nodeComponent = useMemo(() => {
      if (!node || !node.position) {
        console.log(
          `NodeRenderer: Node with ID ${id} not found or has invalid position.`
        );
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
    }, [node, commonProps, selected, onNodeResizeStop]);

    return nodeComponent;
  },
  (prevProps, nextProps) => {
    // Custom comparison function to determine if re-render is necessary
    return (
      prevProps.id === nextProps.id &&
      prevProps.selected === nextProps.selected &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  }
);

NodeRenderer.displayName = 'NodeRenderer';

export default NodeRenderer;
