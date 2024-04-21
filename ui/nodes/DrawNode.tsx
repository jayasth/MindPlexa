import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './DrawNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface DrawNodeData {
  color?: string;
  width?: number;
  height?: number;
}

interface DrawNodeProps extends NodeProps {
  data: DrawNodeData;
  onDelete: () => void;

  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const DrawNode: React.FC<DrawNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.drawNode}
      style={{
        backgroundColor: data.color || 'transparent',
        width: data.width || 'auto',
        height: data.height || 'auto'
      }}
    >
      <div className={styles.drawHeader}>
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
      <div className={styles.drawContent}>
        {/* Drawing content would be rendered here */}
      </div>
    </div>
  );
};

export default DrawNode;
