// ui/nodes/NoteNode.tsx
import React from 'react';
import styles from './NoteNode.module.css';
import { FaTrash, FaPalette, FaExpand } from 'react-icons/fa';

interface NoteNodeProps {
  content: string;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onResize: (width: number, height: number) => void;
  color: string; // new prop
  width: number; // new prop
  height: number; // new prop
}

const NoteNode: React.FC<NoteNodeProps> = ({
  content,
  onDelete,
  onChangeColor,
  onResize,
  color, // new prop
  width, // new prop
  height // new prop
}) => {
  return (
    <div className={styles.noteNode}>
      <div className={styles.noteHeader}>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
          title="Delete Node"
        >
          <FaTrash size="10" />
        </button>
        <button
          onClick={() => onChangeColor(color)} // use color prop
          className={styles.colorButton}
          title="Change Color"
        >
          <FaPalette size="10" />
        </button>
        <button
          onClick={() => onResize(width, height)} // use width and height props
          className={styles.resizeButton}
          title="Resize Node"
        >
          <FaExpand size="10" />
        </button>
      </div>
      <textarea className={styles.noteContent} value={content} readOnly />
    </div>
  );
};

export default NoteNode;
