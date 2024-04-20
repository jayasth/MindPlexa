import React from 'react';
import styles from './CodeNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';
import { Tables } from 'types_db';
import { NodeProps } from 'reactflow';

interface CodeNodeProps extends NodeProps {
  node: Tables<'code_nodes'>;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const CodeNode: React.FC<CodeNodeProps> = ({
  node,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.codeNode}
      style={{
        backgroundColor: node.color || undefined,
        width: node.width || undefined,
        height: node.height || undefined
      }}
    >
      <div className={styles.codeHeader}>
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
      <textarea
        className={styles.codeContent}
        value={node.code || ''}
        readOnly
      />
    </div>
  );
};

export default CodeNode;
