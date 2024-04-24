import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import customStyles from './CustomNode.module.css';
import baseStyles from './BaseNode.module.css';

interface CustomNodeData {
  id: string;
  title?: string | null;
  data?: any;
  width?: number | null;
  height?: number | null;
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData;
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

const CustomNode: React.FC<CustomNodeProps> = ({
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
  const [size, setSize] = useState({ width: 200, height: 300 });

  useEffect(() => {
    if (data.width && data.height) {
      setSize({ width: data.width, height: data.height });
    }
  }, [data.width, data.height]);

  const handleResize = (e) => {
    const element = e.target.closest('.resizable');
    if (element) {
      const newWidth = element.clientWidth;
      const newHeight = element.clientHeight;
      setSize({ width: newWidth, height: newHeight });
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
        title={data.title || 'Untitled Custom Node'}
        onDelete={onDelete}
      />
      <div className={customStyles.customNodeContent}>
        {data.data &&
          Object.entries(data.data).map(([key, value]) => (
            <div key={key} className={customStyles.customNodeField}>
              <span className={customStyles.customNodeFieldLabel}>{key}: </span>
              {typeof value === 'string' || typeof value === 'number'
                ? value
                : JSON.stringify(value)}
            </div>
          ))}
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
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default CustomNode;
