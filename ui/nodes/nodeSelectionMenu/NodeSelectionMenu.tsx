import React, { useEffect, useRef } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import {
  FaTasks,
  FaCode,
  FaPaintBrush,
  FaRegAddressBook
} from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './NodeSelectionMenu.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { nanoid } from 'nanoid';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

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
  const { removeNode, addNode, nodes, addEdge, updateNode } = useStore(
    (state) => ({
      removeNode: state.removeNode,
      addNode: state.addNode,
      nodes: state.nodes,
      addEdge: state.addEdge,
      updateNode: state.updateNode
    })
  );

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nodeRef.current &&
        !nodeRef.current.contains(event.target as Node) &&
        !(event.target as Element).classList.contains('node-type-button') &&
        data.onClose
      ) {
        data.onClose();
        removeNode(data.id);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [data, removeNode]);

  const nodeTypes = ['note', 'task', 'custom', 'code', 'draw'];
  const icons: Record<string, JSX.Element> = {
    note: <PiNotepad />,
    task: <FaTasks />,
    custom: <FaRegAddressBook />,
    code: <FaCode />,
    draw: <FaPaintBrush />
  };

  const handleNodeTypeSelect = (
    selectedNodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    if (
      !data.position ||
      data.position.x === undefined ||
      data.position.y === undefined
    ) {
      alert('Error: Invalid position for node creation.');
      return;
    }
    replaceNodeWithType(selectedNodeType, data.position);
  };

  const replaceNodeWithType = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
    position: { x: number; y: number }
  ) => {
    console.log('NodeSelectionMenu: replaceNodeWithType');
    const newNode = {
      id: id, // Use existing NodeSelectionMenu id
      type: nodeType,
      position: position, // Use existing NodeSelectionMenu position
      data: { label: 'New Node' },
      width: nodeDimensions[nodeType].width,
      height: nodeDimensions[nodeType].height
    };

    // Update the new node with the parent node information
    if (parentNode) {
      newNode.data = {
        ...newNode.data,
        parentNode: parentNode
      } as any;
    }

    // Remove the NodeSelectionMenu
    removeNode(id);

    // Add the new node
    addNode(newNode);

    // Update the edges to connect the new node with the parent node
    if (parentNode) {
      const newEdgeId = nanoid();
      addEdge({
        id: newEdgeId,
        source: parentNode.id,
        target: id, // Use existing NodeSelectionMenu id
        type: 'customEdge'
      });
    }
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
              handleNodeTypeSelect(
                type as 'note' | 'task' | 'custom' | 'code' | 'draw'
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
        className={`${styles.nodeSelectionMenuHandle} ${edgeStyles.reactFlowHandleTop}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${styles.nodeSelectionMenuHandle} ${edgeStyles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default NodeSelectionMenu;
