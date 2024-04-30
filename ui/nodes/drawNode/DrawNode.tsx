import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer, OnResize } from 'reactflow';
import BaseNodeHeader from '@/ui/nodes/BaseNodeHeader';
import BaseNodeFooter from '@/ui/nodes/BaseNodeFooter';
import drawStyles from './DrawNode.module.css';
import baseStyles from '@/ui/nodes/BaseNode.module.css';
import styles from '@/ui/edges/EdgeStyles.module.css';

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
  selected: boolean;
}

const DrawNode: React.FC<DrawNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onTag,
  onAttach,
  selected
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
    setSize(newSize);
  };

  return (
    <div
      className={`${baseStyles.baseNode} ${drawStyles.drawNode}`}
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
      />
      <Handle
        type="target"
        position={Position.Top}
        className={`${styles.reactFlowHandle} ${styles.reactFlowHandleTop}`}
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
        className={`${styles.reactFlowHandle} ${styles.reactFlowHandleBottom}`}
      />
    </div>
  );
};

export default DrawNode;
