import React from 'react';
import { Handle, Position, Node } from 'reactflow';
import {
  FaTasks,
  FaCode,
  FaPaintBrush,
  FaRegAddressBook
} from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import { useStore } from '@/app/store/useCanvasStore';
import { Node as BaseNode } from '@/ui/canvasEditor/nodeTypes';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';

export interface NodeSelectionMenuProps {
  data: {
    onSelect: (nodeType: string, position: { x: number; y: number }) => void;
    position?: { x: number; y: number };
    onClose: () => void;
    id?: string;
    isStandalone?: boolean;
  } & BaseNode;
}

const NodeSelectionMenu: React.FC<NodeSelectionMenuProps> = ({ data }) => {
  const { addChildNode } = useStore((state) => ({
    addChildNode: state.addChildNode
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
  const defaultPosition = { x: 0, y: 0 };

  const handleNodeTypeSelect = (
    nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    const position = data.position || { x: 0, y: 0 };
    const parentNode: Node = {
      id: data.id || 'new-node',
      type: data.type,
      position: position,
      data: {}
    };

    // Retrieve existing nodes here
    const existingNodes = []; // Replace this with your actual existing nodes

    createNode(nodeType, position, existingNodes, (newNode) => {
      addChildNode(parentNode, newNode.position, nodeType);
      data.onSelect(nodeType, position);
      data.onClose();
    });
  };

  const menuPosition = data.position || defaultPosition;

  return (
    <div
      className="bg-white shadow-lg rounded p-1"
      style={{
        position: 'absolute',
        left: menuPosition.x,
        top: menuPosition.y
      }}
    >
      {data.id && !data.isStandalone && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`handle-${data.id}-top`}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`handle-${data.id}-bottom`}
          />
        </>
      )}
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
    </div>
  );
};

export default NodeSelectionMenu;
