import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './NoteNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';
import { Tables } from 'types_db';

interface NoteNodeProps extends NodeProps {
  // Extend NodeProps
  node: Tables<'note_nodes'>;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const NoteNode: React.FC<NoteNodeProps> = ({
  node,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.noteNode}
      style={{
        backgroundColor: node.color || undefined,
        width: node.width || undefined,
        height: node.height || undefined
      }}
    >
      <div className={styles.noteHeader}>
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
        className={styles.noteContent}
        value={node.content || ''}
        readOnly
      />
    </div>
  );
};

export default NoteNode;
