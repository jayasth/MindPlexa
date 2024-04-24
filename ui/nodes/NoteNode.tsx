import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import noteStyles from './NoteNode.module.css';
import baseStyles from './BaseNode.module.css';

interface NoteNodeProps {
  data: any;
  onDelete: () => void;
  onChangeColor: () => void;
  onTag: () => void;
  onAttach: () => void;
  selected: boolean;
  id: string;
  type: string;
  zIndex: number;
  isConnectable: boolean;
  xPos: number;
  yPos: number;
  dragging: boolean;
}

const NoteNode: React.FC<NoteNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onTag,
  onAttach,
  selected,
  id,
  type,
  zIndex,
  isConnectable,
  xPos,
  yPos,
  dragging
}) => {
  // State to manage width and height
  const [size, setSize] = useState({ width: 200, height: 100 });

  // Effect to handle changes from external props
  useEffect(() => {
    console.log(
      'Checking if data.width and data.height are provided:',
      data.width,
      data.height
    );
    if (data.width && data.height) {
      console.log('Setting size from data:', data.width, data.height);
      setSize({ width: data.width, height: data.height });
    }
  }, [data.width, data.height]);

  // Function to handle manual resizing
  const handleResize = (e) => {
    console.log('Mouse up event on resizable element:', e);
    const element = e.target.closest('.resizable');
    if (element) {
      const newWidth = element.clientWidth;
      const newHeight = element.clientHeight;
      console.log(
        'New dimensions from resizable element:',
        newWidth,
        newHeight
      );
      setSize({ width: newWidth, height: newHeight });
    } else {
      console.log('No resizable element found on mouse up event.');
    }
  };

  return (
    <div
      className={`${baseStyles.baseNode} resizable`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        resize: 'both',
        overflow: 'auto'
      }}
      onMouseUp={handleResize}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <BaseNodeHeader
        title={data.title || 'Untitled Note'}
        onDelete={onDelete}
      />
      <textarea
        className={noteStyles.noteContent}
        value={data.content || ''}
        readOnly
      />
      <BaseNodeFooter
        onChangeColor={onChangeColor}
        onTag={onTag}
        onAttach={onAttach}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default NoteNode;
