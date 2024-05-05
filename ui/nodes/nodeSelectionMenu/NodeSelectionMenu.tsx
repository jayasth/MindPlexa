import React, { useEffect } from 'react';
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

interface NodeSelectionMenuProps extends NodeProps {
  data: {
    onSelect: (nodeType: string, position: { x: number; y: number }) => void;
    onClose: () => void;
    position: { x: number; y: number };
    id: string;
    type: string;
    parentNode: any;
    isTemporary?: boolean;
  };
  width: number;
  height: number;
  xPos: number; // Added xPos and yPos props
  yPos: number;
}

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({
  data,
  width,
  height,
  xPos, // Use xPos and yPos props
  yPos
}) => {
  const { addChildNode, removeNode } = useStore((state) => ({
    addChildNode: state.addChildNode,
    removeNode: state.removeNode
  }));

  const nodeTypes: ('note' | 'task' | 'custom' | 'code' | 'draw')[] = [
    'note',
    'task',
    'custom',
    'code',
    'draw'
  ];
  const icons = {
    note: <PiNotepad size="16" />,
    task: <FaTasks size="16" />,
    custom: <FaRegAddressBook size="16" />,
    code: <FaCode size="16" />,
    draw: <FaPaintBrush size="16" />
  };

  const handleNodeTypeSelect = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    const { parentNode, position } = data;
    if (parentNode && position) {
      data.onSelect(nodeType, position);
      data.onClose();
      if (data.isTemporary) {
        removeNode(data.id || '');
      }
    } else {
      console.error('Invalid or incomplete parent node or position.');
    }
  };

  useEffect(() => {
    return () => {
      if (data.isTemporary) {
        removeNode(data.id || '');
      }
    };
  }, [data.id, data.isTemporary, removeNode]);

  const menuPosition = data.position || { x: 0, y: 0 };

  return (
    <div className={styles.nodeSelectionMenu} style={{ width, height }}>
      <Handle
        type="target"
        position={Position.Top}
        className={`${styles.nodeSelectionMenuHandle} ${edgeStyles.reactFlowHandleTop}`}
      />
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
        type="source"
        position={Position.Bottom}
        className={`${styles.nodeSelectionMenuHandle} ${edgeStyles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default NodeSelectionMenu;
