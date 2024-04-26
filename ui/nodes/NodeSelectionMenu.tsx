import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaTasks, FaCode, FaPaintBrush } from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import { FaRegAddressBook } from 'react-icons/fa';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';

export interface NodeSelectionMenuProps {
  data: {
    onSelect: (nodeType: string, position: { x: number; y: number }) => void;
  } & BaseNode;
}

const icons = {
  note: <PiNotepad size="15" />,
  task: <FaTasks size="15" />,
  custom: <FaRegAddressBook size="15" />,
  code: <FaCode size="15" />,
  draw: <FaPaintBrush size="15" />
};

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({ data }) => {
  const nodeTypes = ['note', 'task', 'custom', 'code', 'draw'];

  // Type guard to check if position is valid
  const isValidPosition = (
    position: any
  ): position is { x: number; y: number } => {
    return (
      position &&
      typeof position.x === 'number' &&
      typeof position.y === 'number'
    );
  };

  const defaultPosition = { x: 0, y: 0 }; // Default position if not valid

  return (
    <div className="bg-white shadow-lg rounded p-1">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-row">
        {nodeTypes.map((type) => (
          <button
            key={type}
            className="p-1 m-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
            onClick={() => {
              const position = isValidPosition(data.position)
                ? data.position
                : defaultPosition;
              data.onSelect(type, position);
            }}
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
