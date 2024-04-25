import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import noteStyles from './NoteNode.module.css';
import baseStyles from './BaseNode.module.css';

interface NoteNodeData {
  id: string;
  content?: string;
  title?: string;
  width?: number;
  height?: number;
}
interface NoteNodeProps extends NodeProps {
  data: NoteNodeData;
  onDelete: () => void;
  onChangeColor: () => void;
  onTag: () => void;
  onAttach: () => void;
  onNodeResizeStop: (newSize: { width: number; height: number }) => void;
}

const NoteNode: React.FC<NoteNodeProps> = ({
  data,
  id,
  selected,
  onDelete,
  onChangeColor,
  onTag,
  onAttach,
  onNodeResizeStop
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

  const handleResizeStop = (newSize: { width: number; height: number }) => {
    setSize(newSize);
    onNodeResizeStop(newSize);
  };

  return (
    <div
      className={`${baseStyles.baseNode}`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={100}
        isVisible={selected}
        onResizeStop={handleResizeStop}
        lineStyle={{ stroke: '#ff0071', strokeWidth: 2 }}
        handleStyle={{ fill: '#ff0071' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
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
      />
    </div>
  );
};

export default NoteNode;
