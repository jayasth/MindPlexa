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
  const { removeNode, addNode, nodes, addEdge, updateNode, edges, removeEdge } =
    useStore((state) => ({
      removeNode: state.removeNode,
      addNode: state.addNode,
      nodes: state.nodes,
      addEdge: state.addEdge,
      updateNode: state.updateNode,
      edges: state.edges,
      removeEdge: state.removeEdge
    }));

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
    console.log('NodeSelectionMenu: Node type selected: ', selectedNodeType);
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
    console.log('NodeSelectionMenu: Replacing node with type: ', nodeType);
    const newNodeId = nanoid();
    const tempNode = nodes.find((n) => n.id === id);

    const newNode = {
      id: newNodeId,
      type: nodeType,
      position: position,
      data: {
        ...(tempNode?.data || {}),
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`
      },
      width: nodeDimensions[nodeType].width,
      height: nodeDimensions[nodeType].height
    };

    removeNode(id);

    addNode(newNode);

    const connectedEdges = edges.filter(
      (edge) => edge.source === id || edge.target === id
    );
    connectedEdges.forEach((edge) => {
      const newEdge = {
        ...edge,
        id: nanoid(),
        source: edge.source === id ? newNodeId : edge.source,
        target: edge.target === id ? newNodeId : edge.target
      };
      addEdge(newEdge);
      removeEdge(edge.id);
    });
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
