import React, { useRef, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { IoList, IoCalendar, IoBrush } from 'react-icons/io5';
import { PiNotepadFill } from 'react-icons/pi';
import { FaTable } from 'react-icons/fa';

import { useNodeStore, useEdgeStore, useCanvasStore } from '@/app/store';
import styles from './NodeSelectionMenu.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { replaceNodeWithType } from '@/ui/canvasEditor/utils/nodeCreation';

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

  const replaceNodeWithTypeHandler = async (
    nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
  ) => {
    console.log('NodeSelectionMenu: Replacing node with type: ', nodeType);
    const tempNode = nodes.find((n) => n.id === data.id);

    if (!tempNode) {
      console.error('Temporary node not found');
      return;
    }

    await replaceNodeWithType(
      nodeType,
      data.id,
      tempNode.position,
      edges,
      (updatedNode) => updateLocalNode(data.id, updatedNode, canvasID),
      canvasID
    );
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
              replaceNodeWithTypeHandler(
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
