import React, { useRef, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import { IoList, IoCalendar, IoBrush } from 'react-icons/io5';
import { PiNotepadFill } from 'react-icons/pi';
import { FaTable } from 'react-icons/fa';

import { useNodeStore, useEdgeStore, useCanvasStore } from '@/app/store';
import styles from './NodeSelectionMenu.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { Database } from '@/types_db';
import { createClient } from '@/utils/supabase/supabaseClient';

interface NodeSelectionMenuProps extends NodeProps {
  data: {
    onSelect: (nodeType: string, position: { x: number; y: number }) => void;
    onClose: () => void;
    position: { x: number; y: number };
    id: string;
    type: string;
    parentNode: any;
  };
  position: { x: number; y: number };
  parentNode: any;
  width: number;
  height: number;
}

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({
  data,
  width,
  height,
  id,
  selected,
  type,
  position,
  parentNode
}) => {
  const {
    removeNode,
    addNode,
    nodes,
    updateNode: updateLocalNode
  } = useNodeStore();

  const { addEdge, edges, removeEdge, updateEdge, setEdges } = useEdgeStore();
  const { canvasID } = useCanvasStore();

  const nodeRef = useRef<HTMLDivElement>(null);

  const nodeTypes = ['note', 'task', 'table', 'calendar', 'draw'];
  const icons = {
    note: <PiNotepadFill />,
    task: <IoList />,
    table: <FaTable />,
    calendar: <IoCalendar />,
    draw: <IoBrush />
  };

  useEffect(() => {
    console.log('NodeSelectionMenu: Node ID:', data.id);
  }, [data.id]);

  const replaceNodeWithType = async (
    nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
  ) => {
    console.log('NodeSelectionMenu: Replacing node with type: ', nodeType);
    const tempNode = nodes.find((n) => n.id === data.id);

    if (!tempNode) {
      console.error('Temporary node not found');
      return;
    }

    const supabase = createClient();

    // First, update the common node properties
    const { data: updatedCommonNode, error: commonError } = await supabase
      .from('nodes')
      .update({ type: nodeType, is_temporary: false })
      .eq('id', data.id)
      .select()
      .single();

    if (commonError) {
      console.error('Error updating common node properties:', commonError);
      return;
    }

    // Then, insert the specific node type
    const tableName = `${nodeType}_nodes` as keyof Database['public']['Tables'];
    const { data: specificNode, error: tableError } = await supabase
      .from(tableName)
      .insert([{ node_id: data.id }])
      .select()
      .single();

    if (tableError) {
      console.error('Error inserting specific node:', tableError);
      return;
    }

    // Update the local node state
    const nodeDimension = nodeDimensions[nodeType];
    const updatedNode = {
      ...tempNode,
      type: nodeType,
      data: {
        ...tempNode.data,
        ...updatedCommonNode,
        ...specificNode,
        view_width: nodeDimension.viewWidth,
        view_height: nodeDimension.viewHeight,
        edit_width: nodeDimension.editWidth,
        edit_height: nodeDimension.editHeight,
        mobile_edit_width: nodeDimension.mobileEditWidth,
        mobile_edit_height: nodeDimension.mobileEditHeight,
        isTemporary: false
      }
    };
    updateLocalNode(data.id, updatedNode, canvasID);

    // Update the edges connected to the node
    const updatedEdges = edges.map((edge) => {
      if (edge.source === data.id || edge.target === data.id) {
        return {
          ...edge,
          source: edge.source === data.id ? data.id : edge.source,
          target: edge.target === data.id ? data.id : edge.target
        };
      }
      return edge;
    });

    setEdges(updatedEdges);
  };

  return (
    <div
      className={styles.nodeSelectionMenu}
      style={{ width, height }}
      ref={nodeRef}
    >
      <div className="flex flex-row">
        {nodeTypes.map((type) => (
          <button
            key={type}
            className={`${styles.nodeButton} node-type-button`}
            onClick={() =>
              replaceNodeWithType(
                type as 'note' | 'task' | 'table' | 'calendar' | 'draw'
              )
            }
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            {icons[type]}
          </button>
        ))}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleTop}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default NodeSelectionMenu;
