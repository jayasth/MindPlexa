import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import customStyles from './CustomNode.module.css';
import baseStyles from './BaseNode.module.css';

interface BaseNodeData {
  id: string;
  canvas_id?: string | null;
  color?: string | null;
  created_at?: string | null;
  height?: number | null;
  position?: any;
  type?: string | null;
  updated_at?: string | null;
  width?: number | null;
}

interface CustomNodeData extends BaseNodeData {
  data?: any; // Assuming 'data' is a dynamic property, replace 'any' with the correct type if available
  title?: string | null;
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData;
  onDelete: () => void;
  onChangeColor: () => void;
  onResize: () => void;
  onTag: () => void;
  onAttach: () => void;
  id: string;
  selected: boolean;
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
  onResize,
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
  return (
    <div className={baseStyles.baseNode}>
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
        onResize={onResize}
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
