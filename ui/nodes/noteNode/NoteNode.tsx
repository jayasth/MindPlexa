import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer, OnResize } from 'reactflow';
import BaseNodeHeader from '@/ui/nodes/BaseNodeHeader';
import BaseNodeFooter from '@/ui/nodes/BaseNodeFooter';
import noteStyles from './NoteNode.module.css';
import baseStyles from '@/ui/nodes/BaseNode.module.css';
import styles from '@/ui/edges/EdgeStyles.module.css';

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

  const handleResizeStop: OnResize = (event, node) => {
    const newSize = {
      width: node.width,
      height: node.height
    };
    console.log('New Size:', newSize);
    setSize(newSize);
    onNodeResizeStop(newSize);
  };
  return (
    <div
      key={`${size.width}-${size.height}`}
      className={`${baseStyles.baseNode}`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={150}
        isVisible={selected}
        onResize={handleResizeStop}
        lineStyle={{ stroke: '#ff0071', strokeWidth: 2 }}
        handleStyle={{ fill: '#ff0071' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className={`${styles.reactFlowHandle} ${styles.reactFlowHandleTop}`}
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
        className={`${styles.reactFlowHandle} ${styles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default NoteNode;
