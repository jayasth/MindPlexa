import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import drawStyles from './DrawNode.module.css';
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

interface DrawNodeData extends BaseNodeData {
  // Assuming 'data' field from the database is used to store specific drawing data
  data?: any; // Replace 'any' with the correct type if available
  title?: string | null;
}

interface DrawNodeProps extends NodeProps {
  data: DrawNodeData;
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

const DrawNode: React.FC<DrawNodeProps> = ({
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
        title={data.title || 'Untitled Note'}
        onDelete={onDelete}
      />
      <div className={drawStyles.drawContent}>
        {/* Drawing content would be rendered here */}
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

export default DrawNode;
