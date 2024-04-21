import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './NoteNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface NoteNodeData {
  content?: string;
  color?: string;
  width?: number;
  height?: number;
}

interface NoteNodeProps extends NodeProps {
  data: NoteNodeData;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
}

const NoteNode: React.FC<NoteNodeProps> = ({
  data,
  onDelete,
  onChangeColor,
  onResize
}) => {
  return (
    <div
      className={styles.noteNode}
      style={{
        backgroundColor: data?.color || 'transparent', // Use optional chaining to safely access color
        width: data?.width || 'auto', // Use optional chaining to safely access width
        height: data?.height || 'auto' // Use optional chaining to safely access height
      }}
    >
      <div className={styles.noteHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
        >
          <FaTrash size={10} />
        </button>
        <button
          onClick={() => onChangeColor(data?.color || '#ffffff')} // Use optional chaining here as well
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size={10} />
        </button>
        <button
          onClick={() => onResize(data?.width ?? 100, data?.height ?? 50)} // Use optional chaining here too
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size={10} />
        </button>
      </div>
      <textarea
        className={styles.noteContent}
        value={data?.content || ''} // Use optional chaining to safely access content
        readOnly
      />
    </div>
  );
};

export default NoteNode;
