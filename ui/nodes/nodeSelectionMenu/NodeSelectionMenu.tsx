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
  const { removeNode, addNode, setNodes, nodes, addEdge } = useStore(
    (state) => ({
      removeNode: state.removeNode,
      addNode: state.addNode,
      setNodes: state.setNodes,
      nodes: state.nodes,
      addEdge: state.addEdge
    })
  );

  const nodeRef = useRef<HTMLDivElement>(null);

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

  const handleNodeTypeSelect = (
    selectedNodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    if (
      !data.position ||
      data.position.x === undefined ||
      data.position.y === undefined
    ) {
      console.error('NodeSelectionMenu: Invalid position:', data.position);
      return; // Prevent further execution if position is invalid
    }
    createNode(
      selectedNodeType,
      data.position,
      nodes,
      (newNode) => {
        addNode(newNode);
        if (parentNode) {
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === parentNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      childNode: newNode.id
                    }
                  }
                : node
            )
          );
          addEdge({
            id: `e-${nanoid()}`,
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
