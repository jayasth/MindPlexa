import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaTasks, FaCode, FaPaintBrush } from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import { FaRegAddressBook } from 'react-icons/fa';
import { Node as BaseNode } from '@/ui/canvasEditor/canvasEditorReducer';

export interface NodeSelectionMenuProps {
  data: {
    onSelect: (nodeType: string) => void;
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

  return (
    <div className="bg-white shadow-lg rounded p-1">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-row">
        {nodeTypes.map((type) => (
          <button
            key={type}
            className="p-1 m-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
            onClick={() => data.onSelect(type)}
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
