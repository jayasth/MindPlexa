import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import noteStyles from './NoteNode.module.css';
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

interface NoteNodeData extends BaseNodeData {
  content?: string | null;
  title?: string | null;
}

interface NoteNodeProps {
  data: NoteNodeData;
  onDelete: () => void;
  onChangeColor: () => void;
  onResize: () => void;
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
      <textarea
        className={noteStyles.noteContent}
        value={data.content || ''}
        readOnly
      />
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

export default NoteNode;
