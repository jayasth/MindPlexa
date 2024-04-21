import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './CustomNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface CustomNodeData {
  title?: string;
  color?: string;
  width?: number;
  height?: number;
  data?: any; // Assuming 'data' is a dynamic property
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.customNode}
      style={{
        backgroundColor: data.color || 'transparent',
        width: data.width || 'auto',
        height: data.height || 'auto'
      }}
    >
      <div className={styles.customNodeHeader}>
        <span className={styles.customNodeTitle}>
          {data.title || 'Custom Node'}
        </span>
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
      <div className={styles.customNodeContent}>
        {data.data &&
          Object.entries(data.data).map(([key, value]) => (
            <div key={key} className={styles.customNodeField}>
              <span className={styles.customNodeFieldLabel}>{key}: </span>
              {typeof value === 'string' || typeof value === 'number'
                ? value
                : JSON.stringify(value)}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CustomNode;
