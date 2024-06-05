import React, { useRef } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

import { IoList, IoCalendar, IoBrush } from 'react-icons/io5';
import { PiNotepadFill } from 'react-icons/pi';
import { FaTable } from 'react-icons/fa6';

import { useStore } from '@/app/store/useCanvasStore';
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
    updateNode,
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

  const replaceNodeWithType = (
    nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw'
  ) => {
    console.log('NodeSelectionMenu: Replacing node with type: ', nodeType);
    const tempNode = nodes.find((n) => n.id === id);

    if (!tempNode) {
      console.error('Temporary node not found');
      return;
    }

    const updatedNode = {
      ...tempNode,
      type: nodeType,
      data: {
        ...(tempNode.data || {}),
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`
      },
      width: nodeDimensions[nodeType].width,
      height: nodeDimensions[nodeType].height
    };

    console.log('NodeSelectionMenu: Updated node:', updatedNode);

    // Update the node in the store
    updateNode(id, updatedNode);

    // Update the edges connected to the node
    const connectedEdges = edges.filter(
      (edge) => edge.source === id || edge.target === id
    );
    console.log('NodeSelectionMenu: Connected edges:', connectedEdges);

    connectedEdges.forEach((edge) => {
      const updatedEdge = {
        ...edge,
        source: edge.source === id ? id : edge.source,
        target: edge.target === id ? id : edge.target
      };

      // Update the edge in the store
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
