import React, { useRef } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

import { IoList, IoCalendar, IoBrush } from 'react-icons/io5';
import { PiNotepadFill } from 'react-icons/pi';
import { FaTable } from 'react-icons/fa';

import { useStore } from '@/app/store/useCanvasStore';
import { updateNode } from '@/utils/canvas/nodeEdgeDatabaseOperations';
import styles from './NodeSelectionMenu.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
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
  const {
    removeNode,
    addNode,
    nodes,
    addEdge,
    updateNode: updateLocalNode,
    edges,
    removeEdge,
    updateEdge
  } = useStore((state) => ({
    removeNode: state.removeNode,
    addNode: state.addNode,
    nodes: state.nodes,
    addEdge: state.addEdge,
    updateNode: state.updateNode,
    edges: state.edges,
    removeEdge: state.removeEdge,
    updateEdge: state.updateEdge
  }));

  const nodeRef = useRef<HTMLDivElement>(null);

  const nodeTypes = ['note', 'task', 'table', 'calendar', 'draw'];
  const icons = {
    note: <PiNotepadFill />,
    task: <IoList />,
    table: <FaTable />,
    calendar: <IoCalendar />,
    draw: <IoBrush />
  };

  const replaceNodeWithType = async (
    nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
  ) => {
    console.log('NodeSelectionMenu: Replacing node with type: ', nodeType);
    const tempNode = nodes.find((n) => n.id === id);

    if (!tempNode) {
      console.error('Temporary node not found');
      return;
    }

    const connectedEdges = edges.filter(
      (edge) => edge.source === id || edge.target === id
    );
    console.log('NodeSelectionMenu: Connected edges:', connectedEdges);

    // Update the existing node in the database
    const { error } = await updateNode(
      id,
      { type: nodeType },
      { content: '' }, // Add default content for the specific node type
      nodeType
    );

    if (error) {
      console.error('Error updating node:', error);
      return;
    }

    // Create a new node object with updated properties
    const updatedNode = {
      ...tempNode,
      type: nodeType,
      data: {
        ...tempNode.data,
        type: nodeType,
        content: ''
      }
    };

    // Update the node in the local state
    updateLocalNode(id, updatedNode);

    // Update the edges connected to the node
    connectedEdges.forEach((edge) => {
      const updatedEdge = {
        ...edge,
        source: edge.source === id ? id : edge.source,
        target: edge.target === id ? id : edge.target
      };
      updateEdge(edge.id, updatedEdge);
    });

    console.log('NodeSelectionMenu: Replacement node and edges updated');
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
