import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  FaTasks,
  FaCode,
  FaPaintBrush,
  FaRegAddressBook
} from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';
import { useCanvas } from '../canvasEditor/CanvasContext';

export interface NodeSelectionMenuProps {
  data: {
    onSelect: (nodeType: string, position: { x: number; y: number }) => void;
    position: { x: number; y: number };
    onClose: () => void;
  } & BaseNode;
}

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({ data }) => {
  const { setNodes, nodes, setEdges, edges } = useCanvas();
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
  const defaultPosition = { x: 0, y: 0 };

  const isValidPosition = (
    position: any
  ): position is { x: number; y: number } => {
    return (
      position &&
      typeof position.x === 'number' &&
      typeof position.y === 'number'
    );
  };

  const handleNodeTypeSelect = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    const position = isValidPosition(data.position)
      ? data.position
      : defaultPosition;
    createNode(nodeType, position, (newNode) => {
      setNodes((currentNodes) => [...currentNodes, newNode]);
      setEdges((currentEdges) => [
        ...currentEdges,
        {
          id: `e${newNode.id}`,
          source: data.id,
          target: newNode.id,
          type: 'mindmap',
          animated: true
        }
      ]);
    });
  };

  return (
    <div
      className="bg-white shadow-lg rounded p-1"
      style={{
        position: 'absolute',
        left: data.position.x,
        top: data.position.y
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-row">
        {nodeTypes.map((type) => (
          <button
            key={type}
            className="p-1 m-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
            onClick={() => handleNodeTypeSelect(type)}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            {icons[type]}
          </button>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default NodeSelectionMenu;
