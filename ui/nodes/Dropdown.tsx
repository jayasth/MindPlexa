import React from 'react';
import { XYPosition } from 'reactflow';

interface DropdownProps {
  position: XYPosition;
  onSelect: (option: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ position, onSelect }) => {
  const options = ['note', 'task', 'custom', 'code', 'draw'];

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded shadow-lg"
      style={{ top: position.y, left: position.x }}
    >
      {options.map((option) => (
        <div
          key={option}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default Dropdown;
