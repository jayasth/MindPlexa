// ui/nodes/CustomNode.tsx
import React from 'react';
import styles from './CustomNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';
import { Tables } from 'types_db';

interface CustomNodeProps {
  node: Tables<'custom_nodes'>;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  node,
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
        <span className={styles.customNodeTitle}>{node.title}</span>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
        >
          <FaTrash size="10" />
        </button>
        <button
          onClick={() => node.color && onChangeColor(node.color)}
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size="10" />
        </button>
        <button
          onClick={() =>
            node.width && node.height && onResize(node.width, node.height)
          }
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size="10" />
        </button>
      </div>
      <div className={styles.customNodeContent}>
        {node.data &&
          Object.entries(node.data).map(([key, value]) => (
            <div key={key} className={styles.customNodeField}>
              <span className={styles.customNodeFieldLabel}>{key}: </span>
              {renderValue(value)}
            </div>
          ))}
        ))
      </div>
    </div>
  );
};

export default CustomNode;
