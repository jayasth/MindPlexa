import React, { useCallback } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { IoList, IoCalendar, IoBrush, IoTrash } from 'react-icons/io5';
import { PiNotepadFill } from 'react-icons/pi';
import { FaTable } from 'react-icons/fa';

import useNodeStore from '@/app/store/nodes/useNodeStore';
import useEdgeStore from '@/app/store/edges/useEdgeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import styles from './NodeSelectionMenu.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { deleteNode, updateNode } from '@/utils/canvas/nodeService';

interface NodeSelectionMenuProps extends NodeProps {
  data: {
    id: string;
    type: string;
    parentNode: any;
  };
}

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({ data, id }) => {
  const { removeNode, updateNode: updateNodeInStore } = useNodeStore();
  const { edges, removeEdge } = useEdgeStore();
  const { canvasId } = useCanvasStore();

  const nodeTypes = ['note', 'task', 'table', 'calendar', 'draw'];
  const icons = {
    note: <PiNotepadFill />,
    task: <IoList />,
    table: <FaTable />,
    calendar: <IoCalendar />,
    draw: <IoBrush />
  };
  const replaceNodeWithType = useCallback(
    async (nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw') => {
      try {
        const updatedNode = {
          type: nodeType,
          data: {
            ...data,
            type: nodeType,
            isEditing: false,
            content: '',
            title: `Untitled ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
          }
        };

        // Update the node in the database
        await updateNode(
          id,
          {
            type: nodeType
          },
          updatedNode.data,
          nodeType
        );

        // Update the node in the store
        await updateNodeInStore(id, updatedNode, canvasId);

        console.log(`Node replaced with ${nodeType} type`);
      } catch (error) {
        console.error('Error replacing node:', error);
      }
    },
    [id, data, updateNodeInStore, canvasId]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteNode(id, 'selection_menu');
      removeNode(id, canvasId);
      edges.forEach((edge) => {
        if (edge.source === id || edge.target === id) {
          removeEdge(edge.id);
        }
      });
      console.log('Node deleted successfully');
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  }, [id, canvasId, removeNode, edges, removeEdge]);

  return (
    <div className={styles.nodeSelectionMenu}>
      <div className="flex flex-row justify-between items-center w-full">
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
        <button
          className={`${styles.nodeButton} node-delete-button`}
          onClick={handleDelete}
          title="Delete"
        >
          <IoTrash />
        </button>
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
