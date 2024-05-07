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
  console.log('NodeSelectionMenu data:', data);
  const { createChildNodeFromDrag, removeNode, updateNode, addNode, addEdge } =
    useStore((state) => ({
      createChildNodeFromDrag: state.createChildNodeFromDrag,
      removeNode: state.removeNode,
      updateNode: state.updateNode,
      addNode: state.addNode,
      addEdge: state.addEdge
    }));

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        data.onClose();
        removeNode(data.id);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [data.id, data.onClose, removeNode]);

  const nodeTypes: ('note' | 'task' | 'custom' | 'code' | 'draw')[] = [
    'note',
    'task',
    'custom',
    'code',
    'draw'
  ];
  const icons = {
    note: <PiNotepad size="12" />,
    task: <FaTasks size="12" />,
    custom: <FaRegAddressBook size="12" />,
    code: <FaCode size="12" />,
    draw: <FaPaintBrush size="12" />
  };

  const handleNodeTypeSelect = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    const { id, position, parentNode } = data;
    console.log('NodeSelectionMenu: Selected nodeType:', nodeType);
    console.log('NodeSelectionMenu: Current node ID:', id);
    console.log('NodeSelectionMenu: Position:', position);

    if (id && position && parentNode) {
      const { nodes, domNode } = useStore.getState();
      const canvasSize = {
        width: domNode?.clientWidth || 0,
        height: domNode?.clientHeight || 0
      };

      createNode(
        nodeType,
        position,
        useStore.getState().nodes,
        (newNode) => {
          updateNode(id, { ...newNode, id });
          addNode(newNode);
          addEdge({
            id: `e-${newNode.id}-${parentNode.id}`,
            source: parentNode.id,
            target: newNode.id,
            type: 'customEdge'
          });
          data.onClose();
          removeNode(id);
        },
        { width: window.innerWidth, height: window.innerHeight },
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
    <div className={styles.nodeSelectionMenu} style={{ width, height }}>
      <div className="flex flex-row">
        {nodeTypes.map((type) => (
          <button
            key={type}
            className={styles.nodeButton}
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
