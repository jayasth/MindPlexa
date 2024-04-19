import React from 'react';
import styles from './DrawNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';
import { Tables } from 'types_db';

interface DrawNodeProps {
  node: Tables<'draw_nodes'>;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const DrawNode: React.FC<DrawNodeProps> = ({
  node,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.drawNode}
      style={{
        backgroundColor: node.color || undefined,
        width: node.width || undefined,
        height: node.height || undefined
      }}
    >
      <div className={styles.drawHeader}>
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
          onClick={() => onResize(node.width ?? 0, node.height ?? 0)}
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size="10" />
        </button>
      </div>
      {/* Placeholder for drawing content */}
      <div className={styles.drawContent}>
        {/* Drawing content would be rendered here */}
      </div>
    </div>
  );
};

export default DrawNode;
