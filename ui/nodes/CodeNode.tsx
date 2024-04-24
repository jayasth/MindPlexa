import React, { useState, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import BaseNodeHeader from './BaseNodeHeader';
import BaseNodeFooter from './BaseNodeFooter';
import codeStyles from './CodeNode.module.css';
import baseStyles from './BaseNode.module.css';

interface CodeNodeData {
  id: string;
  code?: string;
  language?: string;
  title?: string;
  width?: number;
  height?: number;
}

interface CodeNodeProps extends NodeProps {
  data: CodeNodeData;
  onDelete: () => void;
  onChangeColor: () => void;
  onTag: () => void;
  onAttach: () => void;
}

const CodeNode: React.FC<CodeNodeProps> = ({
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
        title={data.title || 'Untitled Code'}
        onDelete={onDelete}
      />
      <textarea
        className={codeStyles.codeContent}
        value={data.code || ''}
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

export default CodeNode;
