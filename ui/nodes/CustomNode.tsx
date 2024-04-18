// ui/nodes/CustomNode.tsx
import React from 'react';
import styles from './CustomNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface CustomNodeProps {
  data: any;
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
  const renderValue = (value: unknown) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return <span className={styles.customNodeFieldValue}>{value}</span>;
    }
    return null;
  };

  return (
    <div className={styles.customNode}>
      <div className={styles.customNodeHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
        >
          <FaTrash size="10" />
        </button>
        <button
          onClick={() => onChangeColor(data.color)}
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size="10" />
        </button>
        <button
          onClick={() => onResize(data.width, data.height)}
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size="10" />
        </button>
      </div>
      <div className={styles.customNodeContent}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className={styles.customNodeField}>
            <span className={styles.customNodeFieldLabel}>{key}: </span>
            {renderValue(value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomNode;
