import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import drawStyles from './DrawNode.module.css';
import baseStyles from './BaseNode.module.css';

interface DrawNodeData {
  id: string;
  data?: any; // Replace 'any' with the correct type if available
  title?: string;
  width?: number;
  height?: number;
}

interface DrawNodeProps extends NodeProps {
  data: DrawNodeData;
  onDelete: () => void;
  onChangeColor: () => void;
  onTag: () => void;
  onAttach: () => void;
}

const DrawNode: React.FC<DrawNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onTag,
  onAttach
}) => {
  const [size, setSize] = useState({
    width: data.width || 200,
    height: data.height || 300
  });

  useEffect(() => {
    if (data.width && data.height) {
      setSize({ width: data.width, height: data.height });
    }
  }, [data.width, data.height]);

  return (
    <div
      className={`${baseStyles.baseNode} resizable`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        resize: 'both',
        overflow: 'auto'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />
      <BaseNodeHeader
        title={data.title || 'Untitled Drawing'}
        onDelete={onDelete}
      />
      <div className={drawStyles.drawContent}>
        {/* Drawing content would be rendered here */}
      </div>
      <BaseNodeFooter
        onChangeColor={onChangeColor}
        onTag={onTag}
        onAttach={onAttach}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
};

export default DrawNode;
