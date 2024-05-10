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
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { nanoid } from 'nanoid';

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
  const { removeNode, addNode, nodes, addEdge } = useStore((state) => ({
    removeNode: state.removeNode,
    addNode: state.addNode,
    nodes: state.nodes,
    addEdge: state.addEdge
  }));

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nodeRef.current &&
        !nodeRef.current.contains(event.target as Node) &&
        !(event.target as Element).classList.contains('node-type-button') &&
        data.onClose // Check if onClose is a function before calling
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
      return; // Prevent further execution if position is invalid
    }
    createAndReplaceNode(selectedNodeType, data.position);
  };

  const createAndReplaceNode = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
    position: { x: number; y: number }
  ) => {
    // Remove the NodeSelectionMenu first
    removeNode(id);

    // Use a timeout to delay the creation of the new node to ensure state updates
    setTimeout(() => {
      createNode(
        nodeType,
        position,
        nodes.filter((n) => n.id !== id), // Ensure the NodeSelectionMenu is not in the list
        (newNode) => {
          addNode({
            ...newNode,
            id: nanoid(), // Generate a new ID for the node
            position: position // Use the same position as the NodeSelectionMenu
          });
          addEdge({
            id: `e-${nanoid()}`,
            source: parentNode.id,
            target: newNode.id,
            type: 'customEdge'
          });
        },
        { width: 0, height: 0 },
        false,
        false,
        parentNode
      );
    }, 0);
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
