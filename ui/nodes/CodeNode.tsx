import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './CodeNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface CodeNodeData {
  code?: string;
  color?: string;
  width?: number;
  height?: number;
}

interface CodeNodeProps extends NodeProps {
  data: CodeNodeData;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const CodeNode: React.FC<CodeNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.codeNode}
      style={{
        backgroundColor: data.color || 'transparent',
        width: data.width || 'auto',
        height: data.height || 'auto'
      }}
    >
      <div className={styles.codeHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
        >
          <FaTrash size={10} />
        </button>
        <button
          onClick={() => onChangeColor(data.color || '#ffffff')}
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size={10} />
        </button>
        <button
          onClick={() => onResize(data.width ?? 100, data.height ?? 50)}
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size={10} />
        </button>
      </div>
      <textarea
        className={styles.codeContent}
        value={data.code || ''}
        readOnly
      />
    </div>
  );
};

export default CodeNode;
