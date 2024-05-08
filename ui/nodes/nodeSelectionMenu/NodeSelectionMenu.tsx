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

interface NodeSelectionMenuProps extends NodeProps {
  data: {
    onSelect: (nodeType: string, position: { x: number; y: number }) => void;
    onClose: () => void;
    position: { x: number; y: number };
    id: string;
    type: string;
    parentNode: any;
  };
  width: number;
  height: number;
}

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({
  data,
  width,
  height
}) => {
  console.log('NodeSelectionMenu: Received data:', data);
  const { createChildNodeFromDrag, addNode, addEdge, removeNode, updateNode } =
    useStore((state) => ({
      createChildNodeFromDrag: state.createChildNodeFromDrag,
      addNode: state.addNode,
      addEdge: state.addEdge,
      removeNode: state.removeNode,
      updateNode: state.updateNode
    }));

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the essential data is present
    if (!data.id || !data.position) {
      console.error(
        'NodeSelectionMenu: Data is missing id or position on mount.'
      );
    } else {
      console.log('NodeSelectionMenu: Initial data check:', data);
    }
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        nodeRef.current &&
        !nodeRef.current.contains(event.target as Node) &&
        !(event.target as Element).classList.contains('node-type-button')
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
  const handleNodeTypeSelect = (nodeType: string) => {
    console.log('NodeSelectionMenu: Selected nodeType:', nodeType);
    const { id, position, parentNode } = data;
    console.log('NodeSelectionMenu: Current node ID:', id);
    console.log('NodeSelectionMenu: Position:', position);

    if (id && position) {
      createNode(
        nodeType as
          | 'note'
          | 'task'
          | 'custom'
          | 'code'
          | 'draw'
          | 'selectionMenu',
        position,
        useStore.getState().nodes,
        (newNode) => {
          const { addNode, addEdge, removeNode } = useStore.getState();
          addNode(newNode);
          if (parentNode) {
            addEdge({
              id: `e-${newNode.id}-${parentNode.id}`,
              source: parentNode.id,
              target: newNode.id,
              type: 'customEdge'
            });
          }
          removeNode(id);
        },
        { width: 0, height: 0 },
        false,
        false,
        parentNode
      );
    } else {
      console.error(
        'NodeSelectionMenu: Invalid or incomplete node ID or position.'
      );
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
            onClick={() => handleNodeTypeSelect(type)}
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
